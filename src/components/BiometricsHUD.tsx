import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CameraOff, ShieldCheck, UserCheck, RefreshCw, X, Check, Lock, Sparkles } from 'lucide-react';
import { UserBiometricProfile } from '../types';
import { audioFx } from '../utils/audioFx';

interface BiometricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserBiometricProfile;
  onUpdateProfile: (profile: UserBiometricProfile) => void;
  onLogSecurityEvent?: (msg: string) => void;
}

const PRESET_PROFILES: UserBiometricProfile[] = [
  {
    id: 'user-alpha',
    name: 'Yan',
    callsign: 'YAN // ALPHA',
    role: 'Chief Engineer & Creator',
    authLevel: 'Alpha (Chief Engineer)',
    faceConfidence: 99.6,
    voiceprintMatch: 98.9,
    lastVerified: 'Just Now',
    retinalScanStatus: 'VERIFIED',
  },
  {
    id: 'user-beta',
    name: 'Sarah Vance',
    callsign: 'VANCE // BETA',
    role: 'Tactical Researcher',
    authLevel: 'Beta (Tactical Operator)',
    faceConfidence: 94.2,
    voiceprintMatch: 92.5,
    lastVerified: '15 min ago',
    retinalScanStatus: 'VERIFIED',
  },
  {
    id: 'user-guest',
    name: 'Guest User',
    callsign: 'GUEST // VISITOR',
    role: 'Standard Access',
    authLevel: 'Guest (Restricted)',
    faceConfidence: 45.0,
    voiceprintMatch: 40.0,
    lastVerified: 'Pending Auth',
    retinalScanStatus: 'LOCKED',
  },
];

export const BiometricsHUD: React.FC<BiometricsModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfile,
  onLogSecurityEvent,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      audioFx.playBlip(600);
    } else {
      audioFx.playBlip(900);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 360, height: 360, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        runScan();
      } catch {
        setCameraActive(false);
        runScan();
      }
    }
  };

  const runScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    audioFx.playScan();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          audioFx.playSuccess();
          if (onLogSecurityEvent) {
            onLogSecurityEvent(`Biometric ID verified for ${currentProfile.name}`);
          }
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Face & Voice Biometrics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                User authentication & personalized interactions
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

        {/* Biometric Scanning Preview Area (Apple Face ID style) */}
        <div className="relative w-full h-52 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-500/30 flex items-center justify-center relative">
                <UserCheck className="w-9 h-9 text-blue-600 dark:text-blue-400" />
                {isScanning && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {currentProfile.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {cameraActive ? 'Camera Active' : 'Click "Enable Camera" for live face scan'}
              </span>
            </div>
          )}

          {/* Verification Badge Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Face Match: <strong>{currentProfile.faceConfidence}%</strong></span>
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Voice: {currentProfile.voiceprintMatch}%
            </span>
          </div>
        </div>

        {/* Profile Details & Match */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                {currentProfile.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentProfile.role}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {currentProfile.authLevel.split(' ')[0]}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentProfile.faceConfidence}%` }}
            />
          </div>
        </div>

        {/* Actions & Switcher */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                cameraActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              <span>{cameraActive ? 'Camera Live' : 'Enable Camera'}</span>
            </button>

            <button
              onClick={runScan}
              disabled={isScanning}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? `Verifying ${scanProgress}%` : 'Re-Authenticate'}</span>
            </button>
          </div>

          {/* Profile Switcher */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Test Profile:</span>
            <select
              value={currentProfile.id}
              onChange={(e) => {
                const sel = PRESET_PROFILES.find((p) => p.id === e.target.value);
                if (sel) {
                  audioFx.playBlip(750);
                  onUpdateProfile(sel);
                }
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {PRESET_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.authLevel.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
