import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Radio } from 'lucide-react';
import { SystemState } from '../types';
import { audioFx } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface VoiceVisualizerProps {
  systemState: SystemState;
  onToggleListening: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  transcript?: string;
  isFullMode?: boolean;
  onCloseFullMode?: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  systemState,
  onToggleListening,
  isListening,
  isSpeaking,
  transcript = '',
  isFullMode = false,
  onCloseFullMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0.2);
  const animFrameIdRef = useRef<number | null>(null);

  // Smooth Canvas Rendering for Fluid Organic Audio Orb
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      let intensity = 0.2;
      if (isSpeaking) {
        intensity = 0.65 + Math.sin(time * 5) * 0.25 + Math.cos(time * 11) * 0.1;
      } else if (isListening) {
        intensity = 0.5 + Math.sin(time * 3) * 0.25;
      } else if (systemState === 'processing') {
        intensity = 0.75 + Math.sin(time * 8) * 0.2;
      }

      setAudioLevel(intensity);

      const baseRadius = isFullMode ? 70 : 28;
      const currentRadius = baseRadius + intensity * (isFullMode ? 35 : 12);

      // Liquid organic gradient layers (Claude / ChatGPT style)
      // Layer 1: Soft Ambient Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, currentRadius * 1.6);
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
      glowGrad.addColorStop(0.6, 'rgba(147, 197, 253, 0.1)');
      glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Deforming Organic Shape
      const wavePoints = 48;
      ctx.beginPath();
      for (let i = 0; i <= wavePoints; i++) {
        const theta = (i / wavePoints) * Math.PI * 2;
        const harmonic =
          Math.sin(theta * 3 + time * 3) * (intensity * (isFullMode ? 10 : 4)) +
          Math.cos(theta * 5 - time * 2) * (intensity * (isFullMode ? 6 : 2));
        const r = currentRadius + harmonic;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Core Gradient
      const coreGrad = ctx.createLinearGradient(
        cx - currentRadius,
        cy - currentRadius,
        cx + currentRadius,
        cy + currentRadius
      );
      if (isSpeaking) {
        coreGrad.addColorStop(0, '#2563eb');
        coreGrad.addColorStop(0.5, '#38bdf8');
        coreGrad.addColorStop(1, '#6366f1');
      } else if (isListening) {
        coreGrad.addColorStop(0, '#0284c7');
        coreGrad.addColorStop(0.5, '#06b6d4');
        coreGrad.addColorStop(1, '#3b82f6');
      } else {
        coreGrad.addColorStop(0, '#3b82f6');
        coreGrad.addColorStop(1, '#1d4ed8');
      }

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
      ctx.shadowBlur = isFullMode ? 30 : 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Center Bright Specular Highlight
      ctx.beginPath();
      ctx.arc(
        cx - currentRadius * 0.25,
        cy - currentRadius * 0.25,
        currentRadius * 0.35,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [systemState, isSpeaking, isListening, isFullMode]);

  // FULL SCREEN ADVANCED VOICE DIALOG (Like ChatGPT Voice)
  if (isFullMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg flex flex-col items-center justify-between h-[80vh] text-center"
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Pascal Voice Engine</span>
            </div>
            {onCloseFullMode && (
              <button
                onClick={onCloseFullMode}
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center Liquid Voice Orb */}
          <div className="flex flex-col items-center justify-center gap-6 my-auto">
            <div
              onClick={onToggleListening}
              className="relative cursor-pointer group flex items-center justify-center"
            >
              <canvas ref={canvasRef} width={280} height={280} className="rounded-full" />
            </div>

            {/* Status & Live Transcript */}
            <div className="flex flex-col items-center gap-2 max-w-sm">
              <span className="text-sm font-medium text-slate-300">
                {isSpeaking
                  ? 'Pascal is speaking...'
                  : isListening
                  ? 'Listening to you...'
                  : systemState === 'processing'
                  ? 'Thinking...'
                  : 'Tap orb to start talking'}
              </span>
              {transcript && (
                <p className="text-base font-normal text-white bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800">
                  "{transcript}"
                </p>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                audioFx.playBlip(900);
                onToggleListening();
              }}
              className={`p-4 rounded-full transition-all cursor-pointer shadow-lg ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {isSpeaking && (
              <button
                onClick={() => {
                  speechEngine.stopSpeaking();
                  audioFx.playBlip(500);
                }}
                className="p-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                title="Interrupt"
              >
                <VolumeX className="w-6 h-6" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // INLINE MINIMAL VOICE VISUALIZER (Within Chat Input/Navbar)
  return (
    <div
      onClick={onToggleListening}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer select-none"
    >
      <canvas ref={canvasRef} width={24} height={24} className="rounded-full" />
      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Voice'}
      </span>
      {isListening ? (
        <MicOff className="w-3.5 h-3.5 text-red-500" />
      ) : (
        <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
      )}
    </div>
  );
};
