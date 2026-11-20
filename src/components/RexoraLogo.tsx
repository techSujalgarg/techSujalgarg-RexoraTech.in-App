import React from 'react';

interface RexoraLogoProps {
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RexoraLogo: React.FC<RexoraLogoProps> = ({
  variant = 'dark',
  showWordmark = true,
  size = 'md',
}) => {
  const iconDimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  const primaryText = variant === 'light' ? 'text-white' : 'text-[#0B162C]';
  const accentText = variant === 'light' ? 'text-[#60A5FA]' : 'text-[#2563EB]';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        className={`${iconDimensions} shrink-0`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="9"
          fill={variant === 'light' ? '#132445' : '#0B162C'}
        />
        <path
          d="M11 29V11H21.5C24.8137 11 27.5 13.4624 27.5 16.5C27.5 19.15 25.46 21.36 22.75 21.88L28.5 29H23.2L18 22.15H15.2V29H11ZM15.2 18.6H21C22.4359 18.6 23.6 17.6598 23.6 16.5C23.6 15.3402 22.4359 14.4 21 14.4H15.2V18.6Z"
          fill="#FFFFFF"
        />
        <path
          d="M25.5 11L30.5 11L25.5 16V11Z"
          fill="#2563EB"
        />
        <rect x="26" y="25" width="4" height="4" rx="1" fill="#3B82F6" />
      </svg>
      {showWordmark && (
        <span className={`font-display font-bold tracking-tight ${textSize} ${primaryText}`}>
          Rexora<span className={accentText}>Tech</span>
        </span>
      )}
    </span>
  );
};
