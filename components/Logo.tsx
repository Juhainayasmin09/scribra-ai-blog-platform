import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  // Generate a unique ID for this instance's gradient to prevent 
  // conflicts when multiple logos are rendered (e.g., Header + Footer)
  const uniqueId = useId().replace(/:/g, ''); 
  const gradientId = `scribra-gradient-${uniqueId}`;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[size]}
      >
        <defs>
          <linearGradient id={gradientId} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2dd4bf" /> {/* teal-400 */}
            <stop offset="1" stopColor="#60a5fa" /> {/* blue-400 */}
          </linearGradient>
        </defs>
        <path
          d="M19.8 4.2C19.8 4.2 18.5 10 13.5 15C8.5 20 3.5 21.5 2 22C2 22 4.5 20 7.5 17C10.5 14 17 6.5 19 5C19.5 4.6 19.8 4.2 19.8 4.2Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M13.5 15C13.5 15 13.8 13.5 15.5 11.5"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
           d="M2 22L1 23"
           stroke={`url(#${gradientId})`}
           strokeWidth="1.5"
           strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className={`font-bold text-[var(--text-primary)] tracking-tight font-sans ${textSizes[size]}`}>
          Scribra
        </span>
      )}
    </div>
  );
};

export default Logo;