import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getAssetUrl } from '../utils/assetUrl';
import { Sparkles, Shield, Zap } from 'lucide-react';

interface MrTechLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showCreator?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  glow?: boolean;
}

export const MrTechLogo: React.FC<MrTechLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  showCreator = false,
  className = '',
  onClick,
  animated = true,
  glow = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const titleSizes = {
    xs: 'text-sm tracking-wide font-black',
    sm: 'text-base tracking-wide font-black',
    md: 'text-lg tracking-wider font-black',
    lg: 'text-2xl tracking-wider font-black',
    xl: 'text-3xl tracking-widest font-black',
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group inline-flex items-center gap-3 select-none transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Premium Emblem Frame with Wonderfull Cyber Ring Animation */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {/* Outer Rotating Glowing Holographic Halo */}
        {glow && (
          <motion.div
            animate={
              animated
                ? {
                    rotate: [0, 360],
                    scale: isHovered ? [1.08, 1.15, 1.08] : [1, 1.04, 1],
                  }
                : {}
            }
            transition={{
              rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"
          />
        )}

        {/* Ambient Pulsing Radar Ring */}
        {animated && (
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="absolute -inset-1.5 rounded-2xl border border-cyan-400/40 pointer-events-none"
          />
        )}

        {/* Outer Beveled Metallic Shield Border */}
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-xl shadow-cyan-500/25 overflow-hidden">
          {/* Inner Glossy Glass Canvas */}
          <div className="relative w-full h-full rounded-[10px] sm:rounded-[14px] bg-[#0A0F1D] flex items-center justify-center overflow-hidden">
            {/* Shimmering Light Sweep Animation */}
            {animated && (
              <motion.div
                animate={{
                  x: ['-140%', '160%'],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none z-20"
              />
            )}

            {/* Logo Image / Monogram */}
            {!imgError ? (
              <img
                src={getAssetUrl('/logo.png')}
                alt="MR TECH AI"
                className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white relative z-10">
                <span className="font-black text-cyan-400 tracking-tighter text-sm sm:text-base">M</span>
                <span className="text-[7px] font-mono text-blue-400 -mt-1 font-bold">TECH</span>
              </div>
            )}

            {/* Corner Precision Tech Accents */}
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-cyan-400 animate-ping z-30" />
            <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-indigo-400 z-30" />
          </div>
        </div>
      </div>

      {/* Brand Typography with Cyber-Luxury Aesthetic */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 drop-shadow-sm ${titleSizes[size]}`}
          >
            MR TECH
          </span>
          <div className="relative flex items-center">
            <span className="relative z-10 text-[10px] sm:text-xs font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
              AI
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
          </div>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              CYBER • TECH • SECURITY
            </span>
          </div>
        )}

        {showCreator && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">
              Created by{' '}
              <strong className="text-cyan-400 font-bold tracking-wider hover:text-cyan-300 transition-colors">
                RAYYAN
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

