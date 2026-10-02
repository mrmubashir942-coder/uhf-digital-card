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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/employee/qr')}
            leftIcon={<Radio className="w-3.5 h-3.5 text-blue-500" />}
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-blue-800/40 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 border-2 border-blue-400/40 flex items-center justify-center shrink-0 text-blue-300">
              <SmartphoneNfc className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  NFC Contactless
                </span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${nfcEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{nfcEnabled ? 'Tap Sharing Enabled' : 'Tap Sharing Paused'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                NFC 'Tap' Sharing & Cards
              </h1>

              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Program any physical NFC card, smart badge, or sticker to instantly launch your verified UHF Solutions business card on iPhones and Androids with a single tap.
              </p>
            </div>
          </div>

          {/* Master NFC Toggle Switch */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 shrink-0">
            <div>
              <p className="text-xs font-bold text-white">NFC Sharing Status</p>
              <p className="text-[11px] text-slate-300">
                {nfcEnabled ? 'Active & Ready' : 'Turned Off'}
              </p>
            </div>

            <button
              onClick={handleToggleNfc}
              disabled={isToggling}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                nfcEnabled ? 'bg-emerald-500' : 'bg-slate-700'
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target URL For Your NFC Chip
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                Dynamic & Permanent
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
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

        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-blue-700 dark:text-blue-300 break-all select-all flex items-center justify-between gap-2">
          <span>{cardUrl}</span>
          <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold shrink-0">
            Standard URI
          </span>
        </div>
      </div>

      {/* Web NFC 1-Click Programmer Banner (Direct in-browser writing for Android) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>1-Click Browser NFC Writer</span>
                {hasWebNfc ? (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 font-semibold">
                    Supported on this Device
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full font-semibold">
                    Available on Android Chrome
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
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
                className="text-white border-slate-700 hover:bg-slate-800 w-full sm:w-auto"
              >
                View App Guide
              </Button>
            )}
          </div>
        </div>

        {nfcWriteStatus && (
          <div className="mt-4 p-3 bg-blue-950/70 border border-blue-700/60 rounded-xl text-xs text-blue-200 flex items-center gap-2 animate-fade-in">
            <Radio className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
            <span>{nfcWriteStatus}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation for Step-by-Step Manual */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('iphone')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'iphone'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>iPhone (iOS) Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('android')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'android'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Android Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'hardware'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cards & Hardware</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'faq'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ & Best Practices</span>
        </button>
      </div>

      {/* TAB CONTENT 1: IPHONE (IOS) PROGRAMMING MANUAL */}
      {activeTab === 'iphone' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Apple className="w-5 h-5 text-slate-900 dark:text-white" />
              <span>How to Program NFC Cards on iPhone (iOS)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Takes less than 30 seconds using the free, industry-standard <strong>NFC Tools</strong> app from the App Store.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Get "NFC Tools" App
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Download the free <strong>NFC Tools</strong> app by <em>wakdev</em> from the iOS App Store.
                </p>
              </div>
              <a
                href="https://apps.apple.com/app/nfc-tools/id1252962749"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
              >
                App Store Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Add URL Record
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Open NFC Tools, tap <strong>Write</strong>, tap <strong>Add a record</strong>, then select <strong>Custom URL / URI</strong>.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-3">
                Standard NDEF format
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Paste Your Card URL
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Paste your permanent digital card URL and tap <strong>OK</strong> in the app.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyUrl} className="w-full text-xs">
                {copied ? 'URL Copied!' : 'Copy Card URL'}
              </Button>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center mb-3">
                  4
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Tap "Write" & Tap Card
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tap <strong>Write / (Bytes)</strong>. Hold the very top edge of your iPhone against your NFC card until the green checkmark appears.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Done!
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>iPhone Tapping Pro Tip:</span>
            </p>
            <p>
              On iPhones (iPhone XS through iPhone 16+), the NFC reader is located at the <strong>very top front and back edge</strong> (near the ear speaker and camera lens). When people tap your card, ask them to tap the top edge of their iPhone to your card.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ANDROID PROGRAMMING MANUAL */}
      {activeTab === 'android' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>How to Program NFC Cards on Android</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Choose between instant 1-click in-browser writing or the free NFC Tools app from Google Play.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method A: In-browser */}
            <div className="p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Method 1: Fastest (No App Needed)
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-2 mb-1">
                Direct Web NFC Writing
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
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
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                Method 2: Google Play App
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-2 mb-1">
                NFC Tools for Android
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal pl-4 mb-4">
                <li>Install <strong>NFC Tools</strong> from Google Play.</li>
                <li>Tap <strong>Write</strong> &gt; <strong>Add a record</strong> &gt; <strong>URL / URI</strong>.</li>
                <li>Paste your card link: <code className="text-blue-600">{cardUrl.substring(0, 30)}...</code></li>
                <li>Tap <strong>Write</strong> and hold card to the back center of phone.</li>
              </ol>
              <a
                href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 hover:underline"
              >
                Google Play Store Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HARDWARE & CARD BUYING GUIDE */}
      {activeTab === 'hardware' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Recommended NFC Card Types & Chips</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Understand which chips and materials work best for long-lasting UHF Solutions digital business cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                #1 Recommended Chip
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1 mb-1">
                NTAG213 / NTAG215
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                NXP NTAG chips have 100% universal compatibility across all modern iPhones and Android phones with zero app requirements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                High Capacity
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1 mb-1">
                NTAG216 (888 Bytes)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provides extra memory space if you ever want to store offline vCard contact data in addition to your digital card URL.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                Materials & Formats
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1 mb-1">
                Cards, Wood & Stickers
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Works on PVC smart cards, Bamboo/Wood cards, epoxy phone tags, keyfobs, and anti-metal phone stickers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Everything you need to know about sharing via NFC tap.
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                Does the receiver need an app to open my NFC card?
              </h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                <strong>No!</strong> Both iPhones (iOS 13+ on iPhone XR/XS or later) and all modern Android devices have background NFC tag reading enabled automatically. They simply tap your card, and a native notification banner slides in asking them to open your card in Safari or Chrome.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                What if I change my phone number or title later?
              </h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                <strong>You never need to reprogram your card!</strong> Because the NFC card points to your dynamic UHF Solutions URL (<code>/card/{employeeId}</code>), whenever you update your phone, photo, or title in this portal, anyone who taps your physical card immediately sees your latest live details.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                Should I password lock my NFC card?
              </h4>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                In the NFC Tools app, you have the option to "Lock Tag" (make read-only). Only do this if you are sure you will never want to rewrite the card for a different employee. Because the URL is dynamic, locking it as read-only is great for preventing tampering!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive NFC Tap Simulator */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          📱 Try the Interactive NFC Tap Simulator
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          See what clients experience on their smartphones when they tap your physical NFC card.
        </p>

        <div className="flex flex-col items-center justify-center">
          <Button
            variant="secondary"
            onClick={() => setSimulateTap(true)}
            leftIcon={<SmartphoneNfc className="w-4 h-4 text-blue-600" />}
          >
            Simulate NFC Tap Now
          </Button>

          {simulateTap && (
            <div className="mt-6 w-full max-w-sm p-4 bg-slate-900 text-white rounded-3xl shadow-2xl border-2 border-blue-500/60 animate-bounce duration-1000">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Nfc className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      NFC Tag Detected
                    </span>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    {designation} • UHF Solutions
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSimulateTap(false)}
                  className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onNavigate(`/card/${employeeId}`)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1 bg-blue-950 rounded-lg border border-blue-800"
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
