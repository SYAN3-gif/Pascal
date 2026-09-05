import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Shield,
  Hand,
  Brain,
  Cpu,
  Radio,
  ArrowUp,
  Scan,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, SystemState, UserBiometricProfile } from '../types';
import { PascalLogo } from './PascalLogo';
import { MarkdownMessage } from './MarkdownMessage';
import { audioFx } from '../utils/audioFx';
import { speechEngine } from '../utils/speechEngine';

interface ChatConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  systemState: SystemState;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  onOpenVoiceModal: () => void;
  onOpenBiometrics: () => void;
  onOpenGestures: () => void;
  onOpenMemory: () => void;
  userProfile: UserBiometricProfile;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  messages,
  onSendMessage,
  systemState,
  isListening,
  isSpeaking,
  onToggleListening,
  onOpenVoiceModal,
  onOpenBiometrics,
  onOpenGestures,
  onOpenMemory,
  userProfile,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, systemState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    audioFx.playBlip(950);
    onSendMessage(input.trim());
    setInput('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    audioFx.playBlip(1100);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    audioFx.playBlip(800);
    speechEngine.speak(text);
  };

  const promptSuggestions = [
    {
      title: 'Biometric Status',
      desc: 'Verify facial & voiceprint authentication',
      icon: Scan,
      action: 'Verify my biometric security status and clearance',
    },
    {
      title: 'Memory & Knowledge',
      desc: 'Review what Pascal remembers about you',
      icon: Brain,
      action: 'What is stored in your active neural memory bank?',
    },
    {
      title: 'Gesture Control',
      desc: 'Test non-verbal hand motion navigation',
      icon: Hand,
      action: 'Calibrate optical hand gesture navigation',
    },
    {
      title: 'System Diagnostics',
      desc: 'Analyze neural load & subsystem health',
      icon: Cpu,
      action: 'Run a full system diagnostics health check',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#090d16]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Screen if only 1 or initial messages */}
          {messages.length <= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 flex flex-col items-center text-center"
            >
              {/* Full Accurate Logo Lockup from user's image */}
              <div className="mb-4 p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center">
                <PascalLogo size="hero" fullLockup={true} isPulsing={false} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mt-1">
                Good day, {userProfile.name.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md font-normal leading-relaxed">
                P.A.S.C.A.L is your personal intelligent assistant with speech synthesis, face ID biometrics, and touchless gesture control.
              </p>

              {/* Suggestion Starter Cards (ChatGPT / Claude style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-xl text-left">
                {promptSuggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        audioFx.playBlip(800);
                        onSendMessage(item.action);
                      }}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Conversation Stream */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex items-center justify-center my-3">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <PascalLogo size="xs" showText={false} />
                  </div>
                )}

                {/* Message Body */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <MarkdownMessage content={msg.text} isUser={isUser} />

                    {/* Action Payload Card if present */}
                    {msg.payload?.actionName && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-[11px] flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-500" />
                          <span>{msg.payload.actionName}</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                          Completed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar (Copy, Speak) */}
                  {!isUser && (
                    <div className="flex items-center gap-1 mt-1.5 text-slate-400">
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        title="Read aloud"
                        className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        title="Copy text"
                        className="p-1 rounded-md hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-[10px] text-slate-400 ml-1 font-mono">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Thinking Indicator */}
          {systemState === 'processing' && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <PascalLogo size="xs" showText={false} isPulsing />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Pascal is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Floating Input Bar (Claude / ChatGPT style) */}
      <div className="p-4 bg-gradient-to-t from-white via-white dark:from-[#090d16] dark:via-[#090d16] to-transparent">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
          >
            {/* Quick Action Pill Triggers */}
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={() => {
                  audioFx.playBlip(750);
                  onOpenBiometrics();
                }}
                title="Face & Voice Biometrics"
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Scan className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  audioFx.playBlip(750);
                  onOpenGestures();
                }}
                title="Gesture Control Lab"
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Hand className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  audioFx.playBlip(750);
                  onOpenMemory();
                }}
                title="Memory Matrix"
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Brain className="w-4 h-4" />
              </button>
            </div>

            {/* Main Text Input */}
            <input
              type="text"
              placeholder="Ask Pascal anything, or use voice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-0 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1.5"
            />

            {/* Voice Mic Mode Trigger */}
            <button
              type="button"
              onClick={() => {
                audioFx.playBlip(900);
                onOpenVoiceModal();
              }}
              title="Open Voice Mode"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Arrow Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all cursor-pointer shrink-0 shadow-sm"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Subtext */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-2 mt-2">
            <span>P.A.S.C.A.L Personal AI • Real-time Voice & Biometrics</span>
            <span>v4.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
