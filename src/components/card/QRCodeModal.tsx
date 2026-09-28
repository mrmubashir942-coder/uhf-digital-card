import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Button } from '../common/Button.tsx';
import { api } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { Download, Copy, Check, QrCode, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  fullName: string;
  designation?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  fullName,
  designation,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState<{
    cardUrl: string;
    pngDataUrl: string;
    svgString: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      api.public
        .getQR(employeeId)
        .then((res) => {
          setQrData(res);
        })
        .catch((err) => {
          console.error('Failed to load QR code:', err);
          showToast('Failed to generate QR code', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, employeeId, showToast]);

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
    link.download = `UHF_${employeeId}_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('PNG QR Code downloaded', 'success');
  };

  const handleDownloadSvg = () => {
    if (!qrData) return;
    const blob = new Blob([qrData.svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UHF_${employeeId}_QRCode.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('SVG Vector QR Code downloaded', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        {/* UHF Solutions Branded Card Top */}
        <div className="w-full bg-slate-900 text-white p-4 rounded-xl mb-4 border border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
              UHF Solutions
            </span>
            <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{fullName}</h4>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{designation || 'Staff'}</p>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-800 rounded border border-slate-700 text-blue-300">
            {employeeId}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200 mb-4 w-64 h-64 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <QrCode className="w-8 h-8 animate-pulse text-blue-500" />
              <span className="text-xs">Generating high-res QR...</span>
            </div>
          ) : qrData ? (
            <img
              src={qrData.pngDataUrl}
              alt={`QR Code for ${fullName}`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <span className="text-xs text-rose-500">Failed to load QR</span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-4 px-2">
          Point any smartphone camera to view this verified employee card. High-resolution vector ready for printing on business badges.
        </p>

        {/* Target URL Preview & Copy */}
        {qrData && (
          <div className="w-full flex items-center gap-1.5 p-1.5 pl-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono flex-1 text-left">
              {qrData.cardUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPng}
            disabled={loading || !qrData}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download PNG
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadSvg}
            disabled={loading || !qrData}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download SVG
          </Button>
        </div>
      </div>
    </Modal>
  );
};
