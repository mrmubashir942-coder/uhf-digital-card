import React, { useState } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Button } from '../common/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { Copy, Check, MessageSquare, Mail, Linkedin, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  fullName: string;
  designation?: string;
  companyName?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
  fullName,
  designation,
  companyName = 'UHF Solutions',
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Card link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Digital Business Card: ${fullName} (${designation || 'Staff'} at ${companyName})`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} - ${url}`)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(
    `Hello,\n\nPlease find the digital business card for ${fullName} at ${companyName}:\n\n${url}\n\nBest regards,\n${companyName}`
  )}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Digital Business Card" maxWidth="sm">
      <div className="space-y-4 pt-1">
        <p className="text-xs text-slate-500">
          Share this verified UHF Solutions digital card with clients, prospects, and colleagues.
        </p>

        {/* Copy Link Field */}
        <div className="flex items-center gap-1.5 p-1.5 pl-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <input
            type="text"
            readOnly
            value={url}
            className="text-xs text-slate-700 dark:text-slate-200 bg-transparent outline-none flex-1 truncate font-mono"
          />
          <Button
            size="sm"
            variant={copied ? 'success' : 'primary'}
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {/* Share Channels */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:scale-102 transition-transform"
          >
            <MessageSquare className="w-5 h-5 mb-1 text-emerald-600" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>

          <a
            href={mailtoUrl}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:scale-102 transition-transform"
          >
            <Mail className="w-5 h-5 mb-1 text-blue-600" />
            <span className="text-xs font-semibold">Email</span>
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:scale-102 transition-transform"
          >
            <Linkedin className="w-5 h-5 mb-1 text-sky-600" />
            <span className="text-xs font-semibold">LinkedIn</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};
