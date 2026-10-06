import React, { useState } from 'react';
import {
  MessageSquare,
  Headphones,
  LayoutGrid,
  X,
  ExternalLink,
  QrCode,
  SmartphoneNfc,
  Sparkles,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './Button.tsx';

interface FloatingQuickActionsProps {
  onNavigate: (path: string) => void;
  isAdmin?: boolean;
}

export const FloatingQuickActions: React.FC<FloatingQuickActionsProps> = ({
  onNavigate,
  isAdmin = false,
}) => {
  const [activeModal, setActiveModal] = useState<'assistant' | 'support' | 'tools' | null>(null);

  return (
    <>
      {/* Floating Vertical Action Dock */}
      <div className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none print:hidden">
        {/* 1. Main UHF Logo Button */}
        <button
          onClick={() => setActiveModal(activeModal === 'assistant' ? null : 'assistant')}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center font-black text-base shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white group"
          title="UHF Digital Assistant"
        >
          <span>U</span>
        </button>

        {/* 2. Message / Assistant Icon */}
        <button
          onClick={() => setActiveModal(activeModal === 'assistant' ? null : 'assistant')}
          className="w-10 h-10 rounded-full bg-white text-[#2563EB] hover:bg-blue-50 border border-blue-200/80 flex items-center justify-center shadow-md shadow-slate-200/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Digital Card Assistant & Guide"
        >
          <MessageSquare className="w-4 h-4 text-[#2563EB]" />
        </button>

        {/* 3. Support / Helpdesk */}
        <button
          onClick={() => setActiveModal(activeModal === 'support' ? null : 'support')}
          className="w-10 h-10 rounded-full bg-white text-[#2563EB] hover:bg-blue-50 border border-blue-200/80 flex items-center justify-center shadow-md shadow-slate-200/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="IT Support & Helpdesk"
        >
          <Headphones className="w-4 h-4 text-[#2563EB]" />
        </button>

        {/* 4. Quick Tools */}
        <button
          onClick={() => setActiveModal(activeModal === 'tools' ? null : 'tools')}
          className="w-10 h-10 rounded-full bg-white text-[#2563EB] hover:bg-blue-50 border border-blue-200/80 flex items-center justify-center shadow-md shadow-slate-200/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Quick Identity Tools"
        >
          <LayoutGrid className="w-4 h-4 text-[#2563EB]" />
        </button>

        {/* 5. Bottom System Online Indicator */}
        <div
          className="relative mt-1 w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white cursor-pointer hover:scale-105 transition-transform"
          title="UHF Core Engine: Online & Healthy"
        >
          <span>U</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
          </span>
        </div>
      </div>

      {/* Assistant Modal */}
      {activeModal === 'assistant' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight leading-tight">
                    UHF Assistant & Quick Actions
                  </h3>
                  <p className="text-[11px] text-blue-100">Enterprise Digital Card Platform</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="text-[#1E3A8A]">
                  <p className="font-bold">Smart Digital Identity Engine</p>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Generate scannable high-resolution dynamic QR codes, export RFC vCards, and share contact profiles instantly via NFC.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#64748B] block mb-2">
                  Quick Navigation
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onNavigate('/card/UHF-001');
                      setActiveModal(null);
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 text-left transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-[#2563EB]" />
                    <div>
                      <p className="font-bold text-[#111827]">Sample Card</p>
                      <p className="text-[10px] text-[#64748B]">Preview UHF-001</p>
                    </div>
                  </button>

                  {isAdmin ? (
                    <button
                      onClick={() => {
                        onNavigate('/admin/employees/new');
                        setActiveModal(null);
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 text-left transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      <div>
                        <p className="font-bold text-[#111827]">New Employee</p>
                        <p className="text-[10px] text-[#64748B]">Issue Digital Card</p>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onNavigate('/employee/qr');
                        setActiveModal(null);
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E7EB] bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 text-left transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-[#2563EB]" />
                      <div>
                        <p className="font-bold text-[#111827]">My QR Code</p>
                        <p className="text-[10px] text-[#64748B]">Badge & Print</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">UHF Solutions v1.0.0</span>
              <Button size="sm" variant="outline" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-[#1E3A8A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight leading-tight">
                    Corporate IT & Support
                  </h3>
                  <p className="text-[11px] text-blue-200">UHF Solutions Technology Operations</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1 text-[#111827] font-bold">
                  <Building className="w-4 h-4 text-[#2563EB]" />
                  <span>Headquarters IT Desk</span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Suite 400, Technology Park, Silicon Boulevard, CA 94025
                </p>
              </div>

              <div className="space-y-2 text-[#334155]">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#64748B]">Support Hotline:</span>
                  <span className="font-bold text-[#111827]">+1 (800) 555-0199</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#64748B]">Technical Email:</span>
                  <span className="font-bold text-[#2563EB]">support@uhfsolutions.com</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#64748B]">Server Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#E5E7EB] text-right">
              <Button size="sm" variant="primary" onClick={() => setActiveModal(null)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Modal */}
      {activeModal === 'tools' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
                  U
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight leading-tight">
                    Quick Identity Utilities
                  </h3>
                  <p className="text-[11px] text-blue-100">Instant Access Tools</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-2.5 text-xs">
              <button
                onClick={() => {
                  onNavigate('/card/UHF-001');
                  setActiveModal(null);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#E5E7EB] bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">Live Digital Card Preview</p>
                    <p className="text-[11px] text-[#64748B]">Open public business card interface</p>
                  </div>
                </div>
                <span className="text-[#2563EB] font-bold text-xs">Launch →</span>
              </button>

              <button
                onClick={() => {
                  onNavigate(isAdmin ? '/admin/dashboard' : '/employee/nfc');
                  setActiveModal(null);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#E5E7EB] bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <SmartphoneNfc className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827]">NFC Tag Simulator</p>
                    <p className="text-[11px] text-[#64748B]">Test smartphone contactless tap exchange</p>
                  </div>
                </div>
                <span className="text-purple-600 font-bold text-xs">Launch →</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#E5E7EB] text-right">
              <Button size="sm" variant="outline" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
