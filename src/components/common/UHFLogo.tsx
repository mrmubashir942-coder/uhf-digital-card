import React from 'react';

interface UHFLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export const UHFLogo: React.FC<UHFLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  className = '',
  variant = 'light',
}) => {
  const sizeMap = {
    xs: { box: 'w-7 h-7 rounded-lg text-sm', font: 'text-xs', subtitle: 'text-[9px]' },
    sm: { box: 'w-8 h-8 rounded-xl text-base', font: 'text-sm', subtitle: 'text-[10px]' },
    md: { box: 'w-10 h-10 rounded-xl text-xl', font: 'text-base', subtitle: 'text-[11px]' },
    lg: { box: 'w-12 h-12 rounded-2xl text-2xl', font: 'text-lg', subtitle: 'text-xs' },
    xl: { box: 'w-16 h-16 rounded-2xl text-3xl', font: 'text-xl', subtitle: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* UHF "U" Squircle Icon */}
      <div
        className={`${currentSize.box} bg-gradient-to-tr from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white font-black shadow-sm shadow-blue-500/25 shrink-0 select-none`}
      >
        <span className="tracking-tighter">U</span>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${
                variant === 'dark' ? 'text-white' : 'text-[#0F172A]'
              } ${currentSize.font}`}
            >
              UHF Solutions
            </span>

            {showBadge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                DIGITAL CARD
              </span>
            )}
          </div>
          <span
            className={`font-medium ${
              variant === 'dark' ? 'text-slate-400' : 'text-[#64748B]'
            } ${currentSize.subtitle}`}
          >
            Enterprise Contact Identity
          </span>
        </div>
      )}
    </div>
  );
};
