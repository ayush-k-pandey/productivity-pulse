
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "100%", animate = false }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="p-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="plus-gradient" x1="60" y1="10" x2="90" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      
      {/* Stylized P Shape */}
      <path 
        id="logo-p-shape"
        d="M25 20C25 14.4772 29.4772 10 35 10H55C71.5685 10 85 23.4315 85 40C85 56.5685 71.5685 70 55 70H45V85C45 90.5228 40.5228 95 35 95C29.4772 95 25 90.5228 25 85V20ZM45 30V50H55C60.5228 50 65 45.5228 65 40C65 34.4772 60.5228 30 55 30H45Z" 
        fill="url(#p-gradient)" 
        className={animate ? "animate-in fade-in slide-in-from-left-12 duration-1000 fill-mode-both" : ""}
      />
      
      {/* Plus Symbol */}
      <g id="logo-plus-symbol" className={animate ? "animate-in fade-in zoom-in-50 duration-700 delay-700 fill-mode-both" : ""}>
        <rect 
          x="72" y="10" 
          width="10" height="26" 
          rx="5" 
          fill="url(#plus-gradient)" 
        />
        <rect 
          x="64" y="18" 
          width="26" height="10" 
          rx="5" 
          fill="url(#plus-gradient)" 
        />
      </g>
    </svg>
  );
};

export default Logo;
