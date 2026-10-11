import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Plus,
  Brain,
  ShieldCheck,
  Hand,
  Cpu,
  Settings as SettingsIcon,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Radio,
  Mic,
  Volume2,
  VolumeX,
  ShieldAlert,
} from 'lucide-react';
import {
  ChatMessage,
  ConversationThread,
  MemoryNode,
  SystemMetrics,
  SystemState,
  ThemeMode,
  UserBiometricProfile,
  GestureType,
  AISettings,
} from './types';
import { PascalLogo } from './components/PascalLogo';
import { ChatConsole } from './components/ChatConsole';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { BiometricsHUD } from './components/BiometricsHUD';
import { GestureControlHUD } from './components/GestureControlHUD';
import { MemoryCore, INITIAL_MEMORIES } from './components/MemoryCore';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { SettingsModal } from './components/SettingsModal';
import { ProtestHubModal } from './components/ProtestHubModal';
import { audioFx } from './utils/audioFx';
import { speechEngine } from './utils/speechEngine';
import { generateClientTacticalResponse } from './utils/tacticalEngine';

const defaultAISettings: AISettings = {
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  persona: 'tactical',
  customSystemPrompt: '',
  useCustomApiKey: false,
  customApiKey: '',
  voiceURI: '',
  pitch: 0.95,
  rate: 1.05,
  volume: 0.9,
  autoSpeakResponses: false,
  latexPhonetizer: true,
  streamSpeed: 'natural',
  sendOnEnter: true,
  showTokenDiagnostics: false,
};

export function App() {
  // Appearance & UI state
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pascal_theme') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return saved;
      }
    }
    document.documentElement.classList.add('dark');
    return 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [soundFxEnabled, setSoundFxEnabled] = useState<boolean>(true);

  // AI & System Settings State
  const [aiSettings, setAISettings] = useState<AISettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pascal_ai_settings');
        if (saved) {
          return { ...defaultAISettings, ...JSON.parse(saved) };
        }
      } catch {}
    }
    return defaultAISettings;
  });
  const [settingsInitialTab, setSettingsInitialTab] = useState<'model' | 'voice' | 'general'>('model');

  // Modals
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [biometricsModalOpen, setBiometricsModalOpen] = useState<boolean>(false);
  const [gestureModalOpen, setGestureModalOpen] = useState<boolean>(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState<boolean>(false);
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [protestModalOpen, setProtestModalOpen] = useState<boolean>(false);

  // Core System States
  const [systemState, setSystemState] = useState<SystemState>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // User Profile
  const [userProfile, setUserProfile] = useState<UserBiometricProfile>({
    id: 'user-alpha',
    name: 'Yan',
    callsign: 'YAN // ALPHA',
    role: 'Chief Engineer & Creator',
    authLevel: 'Alpha (Chief Engineer)',
    faceConfidence: 99.6,
    voiceprintMatch: 98.9,
    lastVerified: 'Just Now',
    retinalScanStatus: 'VERIFIED',
  });

  // Memories
  const [memories, setMemories] = useState<MemoryNode[]>(INITIAL_MEMORIES);

  // Subsystem Metrics
  const [metrics, setMetrics] = useState<SystemMetrics>({
    neuralLoad: 18,
    quantumSync: 99.8,
    coreTemp: 34.2,
    memoryUsage: 24,
    subsystems: {
      voiceEngine: 'OPTIMAL',
      biometricSentinel: 'ACTIVE',
      gestureOptical: 'ENGAGED',
      memoryMatrix: 'SYNCHRONIZED',
      neuralSynthesis: 'ONLINE',
    },
  });

  // Conversations
  const [threads, setThreads] = useState<ConversationThread[]>([
    {
      id: 'thread-1',
      title: 'Primary Computing Session',
      date: 'Today',
      messages: [
        {
          id: 'msg-0',
          sender: 'pascal',
          text: 'Good day, Yan. P.A.S.C.A.L online and fully synchronized. Facial recognition is verified at 99.6%, vocal synthesis is calibrated, and gesture sensors are standing by. How may I assist you today?',
          timestamp: '10:00 AM',
          category: 'dialogue',
        },
      ],
    },
    {
      id: 'thread-2',
      title: 'Biometrics & Security Audit',
      date: 'Yesterday',
      messages: [
        {
          id: 'msg-prev-1',
          sender: 'user',
          text: 'Run security status',
          timestamp: 'Yesterday',
        },
        {
          id: 'msg-prev-2',
          sender: 'pascal',
          text: 'All biometric thresholds passed for Yan [Chief Engineer Alpha]. No anomalies detected.',
          timestamp: 'Yesterday',
        },
      ],
    },
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Sync Dark/Light theme class with DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('pascal_theme', themeMode);
    } catch {}
  }, [themeMode]);

  // Sync speech engine callbacks
  useEffect(() => {
    speechEngine.onSpeakingStateChange = (speaking) => {
      setIsSpeaking(speaking);
      if (speaking) {
        setSystemState('speaking');
      } else {
        setSystemState('idle');
      }
    };

    // Initialize speech options with current AI settings
    speechEngine.voiceOptions = {
      pitch: aiSettings.pitch,
      rate: aiSettings.rate,
      volume: aiSettings.volume,
      voiceURI: aiSettings.voiceURI,
      latexPhonetizer: aiSettings.latexPhonetizer,
    };
  }, []);

  const handleUpdateAISettings = (partial: Partial<AISettings>) => {
    setAISettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem('pascal_ai_settings', JSON.stringify(updated));
      } catch {}
      speechEngine.voiceOptions = {
        pitch: updated.pitch,
        rate: updated.rate,
        volume: updated.volume,
        voiceURI: updated.voiceURI,
        latexPhonetizer: updated.latexPhonetizer,
      };
      return updated;
    });
  };

  const handleExportChat = (format: 'markdown' | 'json') => {
    const thread = activeThread;
    let dataStr = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'json') {
      dataStr = JSON.stringify(thread, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      mimeType = 'text/markdown';
      extension = 'md';
      dataStr =
        `# ${thread.title}\n*Date: ${thread.date}*\n*Exported from P.A.S.C.A.L Neural Matrix*\n\n---\n\n` +
        thread.messages
          .map(
            (m) =>
              `### **${m.sender === 'user' ? userProfile.name : 'P.A.S.C.A.L'}** (${m.timestamp})\n\n${m.text}\n`
          )
          .join('\n---\n\n');
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pascal-${thread.id}-${Date.now()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleSoundFx = () => {
    const next = !soundFxEnabled;
    setSoundFxEnabled(next);
    audioFx.enabled = next;
    if (next) audioFx.playSuccess();
  };

  const handleNewChat = () => {
    audioFx.playBlip(900);
    const newThread: ConversationThread = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      date: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'pascal',
          text: `At your service, ${userProfile.name}. How can I assist you with your projects today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'dialogue',
        },
      ],
    };
    setThreads([newThread, ...threads]);
    setActiveThreadId(newThread.id);
  };

  const handleSendMessage = async (userText: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeStr,
      category: 'dialogue',
    };

    // Append user message immediately to the active thread
    const updatedMessages = [...activeThread.messages, userMsg];
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, messages: updatedMessages } : t))
    );

    setSystemState('processing');

    try {
      // Send real chat transmission to Gemini via backend server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile,
          model: aiSettings.model,
          temperature: aiSettings.temperature,
          persona: aiSettings.persona,
          customSystemPrompt: aiSettings.customSystemPrompt,
          customApiKey: aiSettings.useCustomApiKey ? aiSettings.customApiKey : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to communicate with P.A.S.C.A.L neural model');
      }

      const replyText = data.reply;

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'pascal',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'dialogue',
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                title: t.messages.length <= 1 ? userText.slice(0, 30) : t.title,
                messages: [...t.messages, assistantMsg],
              }
            : t
        )
      );

      audioFx.playSuccess();
      if (aiSettings.autoSpeakResponses || voiceModalOpen) {
        speechEngine.speak(replyText);
      }
    } catch (error: any) {
      console.warn('Backend communication failed or offline; activating client tactical engine:', error);
      const offlineReply = generateClientTacticalResponse(userText, userProfile);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'pascal',
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'dialogue',
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                title: t.messages.length <= 1 ? userText.slice(0, 30) : t.title,
                messages: [...t.messages, assistantMsg],
              }
            : t
        )
      );

      audioFx.playSuccess();
      if (aiSettings.autoSpeakResponses || voiceModalOpen) {
        speechEngine.speak(offlineReply);
      }
    } finally {
      setSystemState('idle');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
      setSystemState('idle');
      audioFx.playBlip(600);
    } else {
      audioFx.playBlip(900);
      setLiveTranscript('');
      setIsListening(true);
      setSystemState('listening');

      speechEngine.startListening(
        (transcript, isFinal) => {
          setLiveTranscript(transcript);
          if (isFinal) {
            setIsListening(false);
            setSystemState('idle');
            if (transcript.trim()) {
              handleSendMessage(transcript.trim());
            }
          }
        },
        () => {
          setIsListening(false);
          setSystemState('idle');
        }
      );
    }
  };

  const handleGestureTriggered = (gesture: GestureType) => {
    if (gesture === 'OPEN_PALM_HALT') {
      speechEngine.stopSpeaking();
    } else if (gesture === 'SWIPE_RIGHT') {
      const idx = threads.findIndex((t) => t.id === activeThreadId);
      if (idx < threads.length - 1) setActiveThreadId(threads[idx + 1].id);
    } else if (gesture === 'SWIPE_LEFT') {
      const idx = threads.findIndex((t) => t.id === activeThreadId);
      if (idx > 0) setActiveThreadId(threads[idx - 1].id);
    } else if (gesture === 'THUMBS_UP_EXECUTE') {
      handleSendMessage('Run quick system diagnostics');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#090d16] text-slate-900 dark:text-white antialiased select-none font-sans">
      {/* LEFT SIDEBAR (Claude / ChatGPT style) */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 0,
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="h-full bg-slate-50 dark:bg-[#0d1322] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden z-20 shrink-0 shadow-sm"
      >
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <PascalLogo
              size="sm"
              showText={true}
              onClick={() => {
                audioFx.playBlip(800);
                setActiveThreadId(threads[0]?.id || 'thread-1');
              }}
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </div>
            <span className="text-[10px] opacity-60 font-mono">⌘K</span>
          </button>

          {/* Assistant Tools & Capabilities */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
              Modules
            </span>

            <button
              onClick={() => {
                audioFx.playBlip(800);
                setProtestModalOpen(true);
              }}
              className="w-full p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border border-rose-300/40 dark:border-rose-900/40"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Protest Field Hub</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Field Ready" />
            </button>

            <button
              onClick={() => {
                audioFx.playBlip(750);
                setMemoryModalOpen(true);
              }}
              className="w-full p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Memory & Knowledge</span>
            </button>

            <button
              onClick={() => {
                audioFx.playBlip(750);
                setBiometricsModalOpen(true);
              }}
              className="w-full p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Biometric Identity</span>
            </button>

            <button
              onClick={() => {
                audioFx.playBlip(750);
                setGestureModalOpen(true);
              }}
              className="w-full p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Hand className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Gesture Control</span>
            </button>

            <button
              onClick={() => {
                audioFx.playBlip(750);
                setDiagnosticsModalOpen(true);
              }}
              className="w-full p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>System Telemetry</span>
            </button>
          </div>

          {/* Recent Conversations List */}
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
              Conversations
            </span>
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  audioFx.playBlip(650);
                  setActiveThreadId(t.id);
                }}
                className={`w-full p-2 rounded-xl text-left text-xs font-medium flex items-center gap-2.5 transition-all truncate cursor-pointer ${
                  t.id === activeThreadId
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{t.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom User Profile Card & Theme Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 flex items-center justify-between">
          <div
            onClick={() => setBiometricsModalOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              {userProfile.name[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {userProfile.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                {userProfile.authLevel.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                audioFx.playBlip(700);
                setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                audioFx.playBlip(700);
                setSettingsInitialTab('general');
                setSettingsModalOpen(true);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="System Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CHAT WORKSPACE (Claude / ChatGPT style) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Minimal Navbar */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Interactive Model Selector Pill */}
            <button
              onClick={() => {
                audioFx.playBlip(750);
                setSettingsInitialTab('model');
                setSettingsModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95 group"
              title="Click to configure AI Model & Persona settings"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {aiSettings.model === 'gemini-2.5-pro'
                  ? 'Gemini 2.5 Pro'
                  : aiSettings.model === 'gemini-3.1-flash-lite'
                  ? 'Gemini 3.1 Flash'
                  : aiSettings.model === 'gemini-flash-latest'
                  ? 'Gemini Flash'
                  : 'Gemini 2.5 Flash'}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60 capitalize">
                {aiSettings.persona}
              </span>
              <SettingsIcon className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            {/* Protest Field Hub Trigger */}
            <button
              onClick={() => {
                audioFx.playBlip(800);
                setProtestModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Open Protest Field Hub & Localhost / Paragon Sync"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Protest Hub</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Direct Settings Trigger */}
            <button
              onClick={() => {
                audioFx.playBlip(750);
                setSettingsInitialTab('model');
                setSettingsModalOpen(true);
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Open System Settings"
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            {/* Quick Theme Switcher Button */}
            <button
              id="header-theme-toggle-btn"
              onClick={() => {
                const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
                audioFx.playBlip(750);
                setThemeMode(nextTheme);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Switch between Light and Dark Mode"
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Inline Voice Pill */}
            <VoiceVisualizer
              systemState={systemState}
              isListening={isListening}
              isSpeaking={isSpeaking}
              onToggleListening={handleToggleListening}
              transcript={liveTranscript}
            />

            {/* Full-Screen Voice Mode Trigger (Like ChatGPT Voice) */}
            <button
              onClick={() => {
                audioFx.playBlip(900);
                setVoiceModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Voice Mode</span>
            </button>
          </div>
        </header>

        {/* Conversation Canvas */}
        <ChatConsole
          messages={activeThread.messages}
          onSendMessage={handleSendMessage}
          systemState={systemState}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleListening={handleToggleListening}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
          onOpenBiometrics={() => setBiometricsModalOpen(true)}
          onOpenGestures={() => setGestureModalOpen(true)}
          onOpenMemory={() => setMemoryModalOpen(true)}
          onOpenProtestHub={() => setProtestModalOpen(true)}
          userProfile={userProfile}
        />
      </main>

      {/* FULL SCREEN ADVANCED VOICE DIALOG */}
      <AnimatePresence>
        {voiceModalOpen && (
          <VoiceVisualizer
            systemState={systemState}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleListening={handleToggleListening}
            transcript={liveTranscript}
            isFullMode={true}
            onCloseFullMode={() => setVoiceModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* BIOMETRICS MODAL (Apple Face ID style) */}
      <BiometricsHUD
        isOpen={biometricsModalOpen}
        onClose={() => setBiometricsModalOpen(false)}
        currentProfile={userProfile}
        onUpdateProfile={(p) => setUserProfile(p)}
      />

      {/* GESTURE CONTROL LAB MODAL */}
      <GestureControlHUD
        isOpen={gestureModalOpen}
        onClose={() => setGestureModalOpen(false)}
        onGestureTriggered={handleGestureTriggered}
      />

      {/* MEMORY & KNOWLEDGE VAULT MODAL */}
      <MemoryCore
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        memories={memories}
        onAddMemory={(node) =>
          setMemories([
            { ...node, id: `mem-${Date.now()}`, timestamp: new Date().toISOString().split('T')[0] },
            ...memories,
          ])
        }
        onDeleteMemory={(id) => setMemories(memories.filter((m) => m.id !== id))}
        onTogglePin={(id) =>
          setMemories(
            memories.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
          )
        }
      />

      {/* SYSTEM TELEMETRY MODAL */}
      <SystemDiagnostics
        isOpen={diagnosticsModalOpen}
        onClose={() => setDiagnosticsModalOpen(false)}
        metrics={metrics}
        onRunDiagnostic={() => {
          setMetrics((prev) => ({
            ...prev,
            neuralLoad: Math.floor(Math.random() * 20) + 12,
            quantumSync: 99.9,
          }));
        }}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        themeMode={themeMode}
        onToggleTheme={(m) => setThemeMode(m)}
        soundFxEnabled={soundFxEnabled}
        onToggleSoundFx={handleToggleSoundFx}
        aiSettings={aiSettings}
        onUpdateAISettings={handleUpdateAISettings}
        initialTab={settingsInitialTab}
        onExportChat={handleExportChat}
        onClearChat={() => {
          setThreads([
            {
              id: 'thread-1',
              title: 'Primary Computing Session',
              date: 'Today',
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  sender: 'pascal',
                  text: 'Conversation history cleared. How may I assist you today, Yan?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  category: 'dialogue',
                },
              ],
            },
          ]);
        }}
      />

      {/* PROTEST & TACTICAL FIELD HUB MODAL */}
      <ProtestHubModal
        isOpen={protestModalOpen}
        onClose={() => setProtestModalOpen(false)}
        onSendChatMessage={(text) => handleSendMessage(text)}
      />
    </div>
  );
}

export default App;
