import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, MoveHorizontal, ZoomIn, Shield, ThumbsUp, X, Sparkles, Zap, Check } from 'lucide-react';
import { GestureType, GestureTelemetry } from '../types';
import { audioFx } from '../utils/audioFx';

interface GestureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGestureTriggered: (gesture: GestureType) => void;
}

const GESTURES = [
  {
    type: 'SWIPE_LEFT' as GestureType,
    label: 'Swipe Left',
    desc: 'Switch to previous conversation / tab',
    icon: MoveHorizontal,
    shortcut: 'Left Arrow (←)',
  },
  {
    type: 'SWIPE_RIGHT' as GestureType,
    label: 'Swipe Right',
    desc: 'Switch to next conversation / tab',
    icon: MoveHorizontal,
    shortcut: 'Right Arrow (→)',
  },
  {
    type: 'OPEN_PALM_HALT' as GestureType,
    label: 'Open Palm (Halt)',
    desc: 'Stop voice speech synthesis instantly',
    icon: Hand,
    shortcut: 'Spacebar',
  },
  {
    type: 'PINCH_FOCUS' as GestureType,
    label: 'Pinch Focus',
    desc: 'Focus conversation window',
    icon: ZoomIn,
    shortcut: 'F Key',
  },
  {
    type: 'THUMBS_UP_EXECUTE' as GestureType,
    label: 'Thumbs Up',
    desc: 'Confirm action / Run health sweep',
    icon: ThumbsUp,
    shortcut: 'Enter Key',
  },
];

export const GestureControlHUD: React.FC<GestureModalProps> = ({
  isOpen,
  onClose,
  onGestureTriggered,
}) => {
  const [activeGesture, setActiveGesture] = useState<GestureType>('NONE');
  const [lastExecuted, setLastExecuted] = useState<string>('Gesture sensors standing by');

  const triggerGesture = (type: GestureType) => {
    audioFx.playGestureWoosh();
    setActiveGesture(type);

    const found = GESTURES.find((g) => g.type === type);
    if (found) {
      setLastExecuted(`Recognized: "${found.label}" -> Action executed`);
    }

    onGestureTriggered(type);

    setTimeout(() => {
      setActiveGesture('NONE');
    }, 1500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowLeft') triggerGesture('SWIPE_LEFT');
      else if (e.key === 'ArrowRight') triggerGesture('SWIPE_RIGHT');
      else if (e.key === ' ') triggerGesture('OPEN_PALM_HALT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Touchless Gesture Control</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Non-verbal hand motion gestures for hands-free navigation
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playBlip(600);
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Feedback Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {lastExecuted}
            </span>
          </div>
          {activeGesture !== 'NONE' && (
            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-medium text-[11px] shadow-sm">
              Active: {activeGesture}
            </span>
          )}
        </div>

        {/* Gesture Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {GESTURES.map((g) => {
            const Icon = g.icon;
            const isActive = activeGesture === g.type;
            return (
              <button
                key={g.type}
                onClick={() => triggerGesture(g.type)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {g.shortcut}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {g.label}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {g.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Click any card to test the trigger</span>
          <button
            onClick={() => {
              audioFx.playSuccess();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
