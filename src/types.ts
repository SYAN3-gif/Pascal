export type SystemState = 'idle' | 'listening' | 'processing' | 'speaking' | 'scanning' | 'alert';

export type ThemeMode = 'dark' | 'light';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pascal' | 'system';
  text: string;
  timestamp: string;
  category?: 'dialogue' | 'command' | 'diagnostic' | 'biometric' | 'memory';
  status?: 'delivered' | 'processed' | 'executing';
  payload?: {
    actionName?: string;
    details?: Record<string, any>;
  };
}

export interface ConversationThread {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

export interface MemoryNode {
  id: string;
  category: 'directive' | 'identity' | 'biometrics' | 'project' | 'preference' | 'security';
  title: string;
  content: string;
  timestamp: string;
  importance: 'critical' | 'high' | 'normal' | 'low';
  synapses: string[];
  pinned?: boolean;
}

export interface UserBiometricProfile {
  id: string;
  name: string;
  callsign: string;
  role: string;
  authLevel: 'Alpha (Chief Engineer)' | 'Beta (Tactical Operator)' | 'Omega (Root Override)' | 'Guest (Restricted)';
  faceConfidence: number;
  voiceprintMatch: number;
  lastVerified: string;
  retinalScanStatus: 'VERIFIED' | 'SCANNING' | 'LOCKED';
  avatar?: string;
}

export type GestureType = 'NONE' | 'SWIPE_LEFT' | 'SWIPE_RIGHT' | 'OPEN_PALM_HALT' | 'PINCH_FOCUS' | 'PEACE_SECURITY' | 'THUMBS_UP_EXECUTE';

export interface GestureTelemetry {
  activeGesture: GestureType;
  confidence: number;
  x: number;
  y: number;
  depth: number;
  velocity: number;
  trackingActive: boolean;
}

export interface SystemMetrics {
  neuralLoad: number;
  quantumSync: number;
  coreTemp: number;
  memoryUsage: number;
  subsystems: {
    voiceEngine: 'OPTIMAL' | 'DEGRADED' | 'STANDBY';
    biometricSentinel: 'ACTIVE' | 'CALIBRATING' | 'OFFLINE';
    gestureOptical: 'ENGAGED' | 'STANDBY' | 'BLOCKED';
    memoryMatrix: 'SYNCHRONIZED' | 'INDEXING' | 'SECURED';
    neuralSynthesis: 'ONLINE' | 'ACTIVE' | 'BURST';
  };
}

export type AIPersonaPreset = 'tactical' | 'concise' | 'academic' | 'creative' | 'custom';

export interface AISettings {
  // Neural Model & API
  model: string;
  temperature: number;
  persona: AIPersonaPreset;
  customSystemPrompt: string;
  useCustomApiKey: boolean;
  customApiKey: string;

  // Voice & Speech Synthesis
  voiceURI: string;
  pitch: number;
  rate: number;
  volume: number;
  autoSpeakResponses: boolean;
  latexPhonetizer: boolean;

  // Interface & Interaction
  streamSpeed: 'instant' | 'natural' | 'fast';
  sendOnEnter: boolean;
  showTokenDiagnostics: boolean;
}
