import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { Button } from '../../components/common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { Download, Copy, Check, QrCode, ExternalLink, ArrowLeft, SmartphoneNfc } from 'lucide-react';

interface EmployeeQRCodeProps {
  onNavigate: (path: string) => void;
}

export const EmployeeQRCodePage: React.FC<EmployeeQRCodeProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState<{
    cardUrl: string;
    pngDataUrl: string;
    svgString: string;
  } | null>(null);

  const employeeId = user?.employeeId || 'UHF-001';
  const fullName = profile?.fullName || user?.fullName || 'Employee';
  const designation = profile?.designation || 'Staff';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.public
      .getQR(employeeId)
      .then((res) => {
        if (isMounted) setQrData(res);
      })
      .catch((err) => {
        console.error('Error generating QR:', err);
        showToast('Failed to load QR code', 'error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [employeeId, showToast]);

  const handleCopy = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.cardUrl);
    setCopied(true);
    showToast('Card URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.pngDataUrl;
    link.download = `UHF_${employeeId}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('PNG QR code downloaded', 'success');
  };

  const handleDownloadSvg = () => {
    if (!qrData) return;
    const blob = new Blob([qrData.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UHF_${employeeId}_QR.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Vector SVG QR code downloaded', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/employee/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(`/card/${employeeId}`)}
          leftIcon={<ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />}
        >
          View Public Card
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-xs flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold mb-4 border border-blue-100">
          <QrCode className="w-3.5 h-3.5" />
          <span>Unique Corporate QR Code</span>
        </div>

        <h1 className="text-2xl font-black text-[#111827] tracking-tight">
          {fullName}
        </h1>
        <p className="text-xs text-[#64748B] mb-6">
          {designation} • ID: <span className="font-mono font-bold text-[#2563EB]">{employeeId}</span>
        </p>

        {/* High-res QR Display */}
        <div className="p-4 bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-xs mb-6 w-72 h-72 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-[#64748B]">
              <QrCode className="w-10 h-10 animate-pulse text-[#2563EB]" />
              <span className="text-xs">Generating Vector QR...</span>
            </div>
          ) : qrData ? (
            <img
              src={qrData.pngDataUrl}
              alt={`QR Code for ${fullName}`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <span className="text-xs text-[#DC2626]">Failed to generate QR code</span>
          )}
        </div>

        {/* Copyable Link */}
        {qrData && (
          <div className="max-w-md w-full flex items-center gap-2 p-2 pl-3 bg-[#F8FAFC] rounded-xl mb-6 border border-[#E5E7EB]">
            <span className="text-xs font-mono text-[#111827] truncate flex-1 text-left">
              {qrData.cardUrl}
            </span>
            <Button
              size="sm"
              variant={copied ? 'success' : 'primary'}
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        )}

        {/* Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full">
          <Button
            variant="primary"
            onClick={handleDownloadPng}
            disabled={loading || !qrData}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download PNG (High-Res)
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadSvg}
            disabled={loading || !qrData}
            leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
          >
            Download Vector SVG
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-left text-xs text-[#64748B] space-y-2 max-w-md">
          <p className="font-semibold text-[#111827]">
            💡 Dynamic QR Advantage:
          </p>
          <p>
            This QR code points directly to your permanent digital card URL (<code className="font-mono text-[#2563EB]">/card/{employeeId}</code>). If you change your phone number, designation, or address, this QR code will continue to work without reprinting!
          </p>

          <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SmartphoneNfc className="w-5 h-5 text-[#2563EB] shrink-0" />
              <div>
                <p className="font-bold text-[#111827] text-xs">Want 1-Tap NFC Sharing?</p>
                <p className="text-[11px] text-[#64748B]">Program physical cards with your digital card.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/employee/nfc')}
              className="px-2.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-colors shrink-0 cursor-pointer"
            >
              NFC Setup →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
