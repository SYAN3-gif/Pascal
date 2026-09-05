import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Cpu,
  Mic,
  Sliders,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Trash2,
  Download,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Binary,
  Code,
  GraduationCap,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { ThemeMode, AISettings, AIPersonaPreset } from '../types';
import { audioFx } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
  aiSettings: AISettings;
  onUpdateAISettings: (settings: Partial<AISettings>) => void;
  onClearChat?: () => void;
  onExportChat?: (format: 'markdown' | 'json') => void;
  initialTab?: 'model' | 'voice' | 'general';
}

type TabType = 'model' | 'voice' | 'general';

const MODEL_OPTIONS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Recommended',
    desc: 'Blazing fast, balanced reasoning & multimodal responses.',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tag: 'Deep Reasoning',
    desc: 'Advanced analysis, mathematical proofs & complex coding.',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    tag: 'Ultra-Fast',
    desc: 'Lightweight architecture for minimal latency execution.',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    tag: 'Continuous',
    desc: 'Always uses the latest production canonical flash endpoint.',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
];

const PERSONA_PRESETS: Array<{
  id: AIPersonaPreset;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
}> = [
  {
    id: 'tactical',
    title: 'Tactical Assistant',
    subtitle: 'J.A.R.V.I.S inspired • Calm, hyper-competent, polite & versatile',
    icon: <Zap className="w-4 h-4 text-blue-500" />,
  },
  {
    id: 'concise',
    title: 'Concise Engineer',
    subtitle: 'Code-first • Zero fluff, crisp bullet points & immediate answers',
    icon: <Code className="w-4 h-4 text-emerald-500" />,
  },
  {
    id: 'academic',
    title: 'Academic & Scientist',
    subtitle: 'Formal rigor • Deep derivations, proofs & structured methodology',
    icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
  },
  {
    id: 'creative',
    title: 'Creative Partner',
    subtitle: 'Expansive • Brainstorming, lively ideation & novel perspectives',
    icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'custom',
    title: 'Custom Directive',
    subtitle: 'Define your own system instructions & specialized role',
    icon: <Sliders className="w-4 h-4 text-slate-500" />,
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onToggleTheme,
  soundFxEnabled,
  onToggleSoundFx,
  aiSettings,
  onUpdateAISettings,
  onClearChat,
  onExportChat,
  initialTab = 'model',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showCustomKey, setShowCustomKey] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Ping & Connection Test State
  const [isTestingLink, setIsTestingLink] = useState<boolean>(false);
  const [linkTestResult, setLinkTestResult] = useState<{
    ok: boolean;
    latencyMs?: number;
    model?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLinkTestResult(null);
      setShowClearConfirm(false);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const loadVoices = () => {
      const v = speechEngine.getAvailableVoices();
      setVoices(v);
      if (v.length > 0 && !aiSettings.voiceURI) {
        const preferred =
          v.find((voice) => voice.name.includes('Daniel') || voice.lang === 'en-GB' || voice.lang === 'en-US') ||
          v[0];
        if (preferred) {
          onUpdateAISettings({ voiceURI: preferred.voiceURI });
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestVoice = () => {
    audioFx.playSuccess();
    speechEngine.speak(
      'P.A.S.C.A.L vocal synthesis calibrated. Vocal model operating nominally at current pitch and speed.'
    );
  };

  const handleTestLatex = () => {
    audioFx.playSuccess();
    speechEngine.speak(
      'Demonstrating mathematical speech synthesis: The Euler-Lagrange equation and the Gaussian integral $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$ are fully vocalized.'
    );
  };

  const handlePingConnection = async () => {
    setIsTestingLink(true);
    setLinkTestResult(null);
    audioFx.playBlip(700);

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: aiSettings.model,
          customApiKey: aiSettings.useCustomApiKey ? aiSettings.customApiKey : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setLinkTestResult({
          ok: true,
          latencyMs: data.latencyMs,
          model: data.model,
        });
        audioFx.playSuccess();
      } else {
        setLinkTestResult({
          ok: false,
          error: data.error || 'Failed to ping neural link',
        });
        audioFx.playBlip(350);
      }
    } catch (err: any) {
      setLinkTestResult({
        ok: false,
        error: err.message || 'Network unreachable',
      });
      audioFx.playBlip(350);
    } finally {
      setIsTestingLink(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col text-slate-900 dark:text-white overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">System Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure neural model, API access, speech calibration & preferences
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playBlip(600);
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/30 dark:bg-slate-900/20">
          <button
            onClick={() => {
              audioFx.playBlip(750);
              setActiveTab('model');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'model'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Model & API</span>
          </button>

          <button
            onClick={() => {
              audioFx.playBlip(750);
              setActiveTab('voice');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice & Audio</span>
          </button>

          <button
            onClick={() => {
              audioFx.playBlip(750);
              setActiveTab('general');
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interface & Data</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= TAB 1: AI MODEL & API ================= */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              {/* Section: Active Model Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Active Neural Model
                  </label>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    Google Gemini Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MODEL_OPTIONS.map((m) => {
                    const isSelected = aiSettings.model === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          audioFx.playBlip(800);
                          onUpdateAISettings({ model: m.id });
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeClass}`}
                          >
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: Temperature / Creativity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Temperature (Creativity & Precision)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {aiSettings.temperature <= 0.2
                        ? '🎯 Precise & Deterministic — Best for mathematics, formal logic, and syntax'
                        : aiSettings.temperature <= 0.7
                        ? '⚖️ Balanced & Analytical — Default blend of reasoning and natural conversation'
                        : '🎨 Creative & Expansive — More varied, imaginative and expressive responses'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                    {aiSettings.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={aiSettings.temperature}
                  onChange={(e) => onUpdateAISettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0.0 (Strict / Code)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Section: Persona & System Directives */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                  AI Persona & System Directives
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {PERSONA_PRESETS.map((p) => {
                    const isSelected = aiSettings.persona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          audioFx.playBlip(750);
                          onUpdateAISettings({ persona: p.id });
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                          {p.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {p.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Prompt Textarea when custom is selected */}
                {aiSettings.persona === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Custom System Instructions:
                    </label>
                    <textarea
                      rows={3}
                      value={aiSettings.customSystemPrompt}
                      onChange={(e) => onUpdateAISettings({ customSystemPrompt: e.target.value })}
                      placeholder="e.g. You are P.A.S.C.A.L specialized in quantum mechanics and TypeScript architecture..."
                      className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none font-mono"
                    />
                  </motion.div>
                )}
              </div>

              {/* Section: API Key & Endpoint Diagnostics */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      API Link & Credentials
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePingConnection}
                    disabled={isTestingLink}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingLink ? 'animate-spin' : ''}`} />
                    <span>{isTestingLink ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                {/* Connection Status Banner */}
                {linkTestResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                      linkTestResult.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {linkTestResult.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span>
                        {linkTestResult.ok
                          ? `Connection Verified • ${linkTestResult.latencyMs}ms Latency • Endpoint: ${linkTestResult.model}`
                          : `Error: ${linkTestResult.error}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Default vs Custom Key Toggle */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Use Custom Gemini API Key
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Override the server default with your own private key
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !aiSettings.useCustomApiKey;
                      onUpdateAISettings({ useCustomApiKey: next });
                      audioFx.playBlip(750);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      aiSettings.useCustomApiKey
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {aiSettings.useCustomApiKey ? 'Custom Key' : 'Default Key'}
                  </button>
                </div>

                {/* Custom API Key Input if enabled */}
                {aiSettings.useCustomApiKey && (
                  <div className="space-y-1 pt-1">
                    <div className="relative">
                      <input
                        type={showCustomKey ? 'text' : 'password'}
                        value={aiSettings.customApiKey}
                        onChange={(e) => onUpdateAISettings({ customApiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full text-xs p-2.5 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomKey(!showCustomKey)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                      >
                        {showCustomKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Your key is securely stored in client memory and used to route queries to Google Gemini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: VOICE & AUDIO ================= */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Vocal Model Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Speech Synthesizer Voice
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestVoice}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Test Voice
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={handleTestLatex}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Test Math
                    </button>
                  </div>
                </div>

                <select
                  value={aiSettings.voiceURI}
                  onChange={(e) => onUpdateAISettings({ voiceURI: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs p-3 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {voices.length > 0 ? (
                    voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} [{v.lang}] {v.default ? '★ (System Default)' : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Default System Voice</option>
                  )}
                </select>
              </div>

              {/* Sliders Grid: Speed, Pitch, Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Speaking Rate */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">Speed</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {aiSettings.rate.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.75}
                    max={1.5}
                    step={0.05}
                    value={aiSettings.rate}
                    onChange={(e) => onUpdateAISettings({ rate: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.75x</span>
                    <span>1.5x</span>
                  </div>
                </div>

                {/* Speaking Pitch */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">Pitch</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {aiSettings.pitch <= 0.8
                        ? 'Deep'
                        : aiSettings.pitch >= 1.2
                        ? 'High'
                        : 'Natural'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={1.4}
                    step={0.05}
                    value={aiSettings.pitch}
                    onChange={(e) => onUpdateAISettings({ pitch: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Deeper</span>
                    <span>Higher</span>
                  </div>
                </div>

                {/* Speaking Volume */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">Volume</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {Math.round(aiSettings.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={aiSettings.volume}
                    onChange={(e) => onUpdateAISettings({ volume: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Mute</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Toggles: Auto-Speak & LaTeX Phonetizer */}
              <div className="space-y-2.5">
                {/* Auto-Speak Responses */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Automatic Speech Output
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Automatically vocalize every assistant reply without having to click Speak
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !aiSettings.autoSpeakResponses;
                      onUpdateAISettings({ autoSpeakResponses: next });
                      audioFx.playBlip(750);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      aiSettings.autoSpeakResponses
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {aiSettings.autoSpeakResponses ? 'Enabled' : 'Manual'}
                  </button>
                </div>

                {/* LaTeX Phonetizer */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      LaTeX & Mathematical Phonetizer
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Converts equations ($E=mc^2$, square roots, fractions) to fluent spoken words
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !aiSettings.latexPhonetizer;
                      onUpdateAISettings({ latexPhonetizer: next });
                      speechEngine.voiceOptions.latexPhonetizer = next;
                      audioFx.playBlip(750);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      aiSettings.latexPhonetizer
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {aiSettings.latexPhonetizer ? 'Active' : 'Off'}
                  </button>
                </div>

                {/* Tactical UI Sound FX */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Tactical Sound Effects
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Futuristic synthesis chimes, keystroke blips & telemetry audio
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleSoundFx}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      soundFxEnabled
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {soundFxEnabled ? 'On' : 'Muted'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: GENERAL & DATA ================= */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Appearance Mode */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      audioFx.playBlip(750);
                      onToggleTheme('light');
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-blue-50 border-blue-500 text-blue-600 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioFx.playBlip(750);
                      onToggleTheme('dark');
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-blue-950/60 border-blue-500 text-blue-400 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>Dark Theme</span>
                  </button>
                </div>
              </div>

              {/* Keyboard & Input Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Keyboard & Messaging
                </span>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Send on Enter
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Press Enter to transmit (Shift + Enter for new line)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !aiSettings.sendOnEnter;
                      onUpdateAISettings({ sendOnEnter: next });
                      audioFx.playBlip(750);
                    }}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                      aiSettings.sendOnEnter
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {aiSettings.sendOnEnter ? 'Enter' : 'Ctrl+Enter'}
                  </button>
                </div>
              </div>

              {/* Export & Data Management */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Chat Data & Transcripts
                </span>

                {onExportChat && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audioFx.playSuccess();
                        onExportChat('markdown');
                      }}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-500" />
                      <span>Export Markdown (.md)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioFx.playSuccess();
                        onExportChat('json');
                      }}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-500" />
                      <span>Export JSON (.json)</span>
                    </button>
                  </div>
                )}

                {/* Clear Chat Button */}
                {onClearChat && (
                  <div>
                    {!showClearConfirm ? (
                      <button
                        type="button"
                        onClick={() => {
                          audioFx.playBlip(500);
                          setShowClearConfirm(true);
                        }}
                        className="w-full p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Conversation History</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2">
                        <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                          Are you sure you want to clear this session?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClearChat();
                              setShowClearConfirm(false);
                              onClose();
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Yes, Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            P.A.S.C.A.L • Neural Engine v4.2 • Auto-Saved
          </span>
          <button
            type="button"
            onClick={() => {
              audioFx.playSuccess();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
