/**
 * Speech Synthesis & Speech Recognition engine for P.A.S.C.A.L.
 * Augmented with advanced LaTeX & Mathematical Phonetizer for natural equation vocalization.
 */

import { prepareTextForSpeech, convertMathExpressionToSpeech } from './latexSpeech';

export interface SpeechEngineOptions {
  pitch?: number;
  rate?: number;
  voiceURI?: string;
  volume?: number;
  latexPhonetizer?: boolean;
}

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  public isListening: boolean = false;
  public isSpeaking: boolean = false;
  public voiceOptions: SpeechEngineOptions = {
    pitch: 0.95,
    rate: 1.05,
    volume: 0.9,
    latexPhonetizer: true,
  };

  public onSpeakingStateChange?: (isSpeaking: boolean) => void;
  private onTranscriptCb: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCb: ((err: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          this.recognition = new SpeechRec();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';

          this.recognition.onstart = () => {
            this.isListening = true;
          };

          this.recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            if (this.onTranscriptCb) {
              this.onTranscriptCb(final || interim, Boolean(final));
            }
          };

          this.recognition.onerror = (event: any) => {
            this.isListening = false;
            if (this.onErrorCb) {
              this.onErrorCb(event.error);
            }
          };

          this.recognition.onend = () => {
            this.isListening = false;
          };
        } catch {
          // Recognition not available
        }
      }
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Prepares and converts text containing LaTeX/Math into natural spoken English.
   */
  public prepareForSpeech(text: string): string {
    if (this.voiceOptions.latexPhonetizer !== false) {
      return prepareTextForSpeech(text);
    }
    return text;
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1500);
      return;
    }

    this.stopSpeaking();

    // Convert LaTeX math and markdown symbols to phonetic speech
    const processedText = this.prepareForSpeech(text);

    if (!processedText.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.pitch = this.voiceOptions.pitch ?? 0.95;
    utterance.rate = this.voiceOptions.rate ?? 1.05;
    utterance.volume = this.voiceOptions.volume ?? 0.9;

    const voices = this.synth.getVoices();
    if (this.voiceOptions.voiceURI) {
      const selected = voices.find((v) => v.voiceURI === this.voiceOptions.voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      const preferred = voices.find(
        (v) =>
          v.name.includes('Daniel') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('Oliver') ||
          (v.lang.startsWith('en') && v.name.includes('Male'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }
  }

  public startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError?: (err: string) => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported on this browser.');
      return;
    }

    this.onTranscriptCb = onTranscript;
    this.onErrorCb = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch {
      // might already be started
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const speechEngine = new SpeechEngine();
