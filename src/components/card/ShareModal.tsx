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
        <p className="text-xs text-[#64748B]">
          Share this verified UHF Solutions digital card with clients, prospects, and colleagues.
        </p>

        {/* Copy Link Field */}
        <div className="flex items-center gap-1.5 p-1.5 pl-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
          <input
            type="text"
            readOnly
            value={url}
            className="text-xs text-[#111827] bg-transparent outline-none flex-1 truncate font-mono"
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
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 transition-colors"
          >
            <MessageSquare className="w-5 h-5 mb-1 text-[#059669]" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>

          <a
            href={mailtoUrl}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100/70 transition-colors"
          >
            <Mail className="w-5 h-5 mb-1 text-[#2563EB]" />
            <span className="text-xs font-semibold">Email</span>
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100/70 transition-colors"
          >
            <Linkedin className="w-5 h-5 mb-1 text-sky-600" />
            <span className="text-xs font-semibold">LinkedIn</span>
          </a>
        </div>
      </div>
    </Modal>
  );
};
