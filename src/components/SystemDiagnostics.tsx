import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Activity, Zap, HardDrive, RefreshCw, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { SystemMetrics } from '../types';
import { audioFx } from '../utils/audioFx';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SystemMetrics;
  onRunDiagnostic: () => void;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onRunDiagnostic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">System Diagnostics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                P.A.S.C.A.L Neural load & subsystem telemetry
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

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Neural Load</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {metrics.neuralLoad}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.neuralLoad}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quantum Sync</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {metrics.quantumSync}%
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.quantumSync}%` }}
              />
            </div>
          </div>
        </div>

        {/* Subsystem Health List */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Active Subsystems
          </span>
          <div className="space-y-2 text-xs">
            {Object.entries(metrics.subsystems).map(([name, status]) => (
              <div key={name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="capitalize">{name.replace(/([A-Z])/g, ' $1')}</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">Kernel v4.2.9</span>
          <button
            onClick={() => {
              audioFx.playScan();
              onRunDiagnostic();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Health Sweep</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
