import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, Maximize2, X, Check } from 'lucide-react';
import { audioFx } from '../utils/audioFx';

interface PascalLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  isPulsing?: boolean;
  className?: string;
  onClick?: () => void;
  fullLockup?: boolean;
  allowShowcase?: boolean;
}

const LOGO_SRC = 'https://i.postimg.cc/HLjspS73/IMG-20260713-WA0007.jpg';

export const PascalLogo: React.FC<PascalLogoProps> = ({
  size = 'md',
  showText = true,
  isPulsing = false,
  className = '',
  onClick,
  fullLockup = false,
  allowShowcase = true,
}) => {
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeDimensions = {
    xs: { px: 28, text: 'text-sm' },
    sm: { px: 38, text: 'text-base' },
    md: { px: 48, text: 'text-lg' },
    lg: { px: 96, text: 'text-2xl' },
    xl: { px: 140, text: 'text-3xl' },
    hero: { px: 260, text: 'text-4xl' },
  };

  const { px, text } = sizeDimensions[size];

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (allowShowcase) {
      audioFx.playBlip(900);
      setShowcaseOpen(true);
    }
  };

  // FULL HERO SHOWCASE CARD (Welcome Screen)
  if (fullLockup || size === 'hero') {
    return (
      <>
        <div
          id="pascal-hero-logo"
          onClick={handleLogoClick}
          className={`flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
          title="Click to view full Brand Showcase"
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Ambient Radial Diffuse Aura */}
            <motion.div
              className="absolute -inset-6 rounded-full bg-gradient-to-tr from-blue-600/15 via-sky-400/10 to-indigo-600/15 blur-2xl pointer-events-none"
              animate={{
                scale: [0.95, 1.1, 0.95],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Presentation Showcase Card */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl dark:shadow-2xl dark:shadow-blue-950/20 flex flex-col items-center transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-blue-500/40">
              
              {/* Inner Glowing Recess for the Logo */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#080d1a] p-4 flex items-center justify-center border border-slate-100 dark:border-slate-800/80">
                
                {/* Visual Glass Sheen on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 dark:via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* The Logo Image with Seamless Dark/Light Adaptation */}
                <img
                  src={LOGO_SRC}
                  alt="P.A.S.C.A.L Intelligent Assistant"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageLoaded(true)}
                  className="w-auto h-auto object-contain rounded-xl max-w-[210px] max-h-[210px] sm:max-w-[240px] sm:max-h-[240px] dark:invert dark:contrast-125 dark:brightness-110 transition-all duration-300"
                />
              </div>

              {/* Status Indicator Pill */}
              <div className="mt-3.5 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 group-hover:border-blue-500/40 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>P.A.S.C.A.L Neural Core</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">v4.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* FULLSCREEN BRAND SHOWCASE MODAL */}
        <AnimatePresence>
          {showcaseOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-[#0e1526] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6 text-center text-slate-900 dark:text-white"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowcaseOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Title */}
                <div>
                  <h3 className="text-lg font-bold tracking-tight">P.A.S.C.A.L Brand Identity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Personal Automated System for Computing Assistance and Learning
                  </p>
                </div>

                {/* Centered High-Def Logo Card */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center w-full max-w-xs">
                  <img
                    src={LOGO_SRC}
                    alt="P.A.S.C.A.L Logo Full"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain rounded-lg dark:invert dark:contrast-125 dark:brightness-110"
                  />
                </div>

                {/* Identity Highlights */}
                <div className="grid grid-cols-3 gap-2 w-full text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">Vocal Engine</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Integrated</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">Biometrics</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Face ID 99.6%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">Gestures</span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5">Touchless Optical</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowcaseOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close Showcase
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // COMPACT LOGO (Navbar, Sidebar, Chat Message Avatar)
  return (
    <div
      id="pascal-logo-badge"
      onClick={handleLogoClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick || allowShowcase ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        {isPulsing && (
          <motion.div
            className="absolute rounded-full pointer-events-none bg-blue-500/20 dark:bg-blue-400/20"
            style={{
              width: px * 1.3,
              height: px * 1.3,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Small Rounded Icon Vessel */}
        <div
          className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-0.5 shadow-sm border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:border-blue-500/50"
          style={{ width: `${px}px`, height: `${px}px` }}
        >
          <img
            src={LOGO_SRC}
            alt="P.A.S.C.A.L Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain dark:invert dark:contrast-125 dark:brightness-110"
          />
        </div>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-semibold tracking-wider text-slate-900 dark:text-white">
            <span className={`font-mono ${text}`}>P</span>
            <span className={`font-mono ${text} text-blue-600 dark:text-blue-400 font-bold`}>Λ</span>
            <span className={`font-mono ${text}`}>S</span>
            <span className={`font-mono ${text}`}>C</span>
            <span className={`font-mono ${text} text-blue-600 dark:text-blue-400 font-bold`}>Λ</span>
            <span className={`font-mono ${text}`}>L</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Your Intelligent Assistant
          </span>
        </div>
      )}
    </div>
  );
};
