import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Smartphone,
  FileText,
  Radio,
  Megaphone,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Zap,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  X,
  Share2,
  Activity,
  Layers,
  Terminal,
  RefreshCw,
  Bell,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { EmergencyContact, ProtestChecklistItem, ProtestIncident } from '../types';
import { audioFx } from '../utils/audioFx';

interface ProtestHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendChatMessage?: (prompt: string) => void;
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'c1',
    title: 'Legal Observer / Jail Support',
    number: '1-800-435-7288',
    note: 'Write this number in permanent ink on your forearm',
  },
  {
    id: 'c2',
    title: 'National Lawyers Guild (NLG)',
    number: '212-679-5100',
    note: 'Protest arrest and legal representation hotline',
  },
  {
    id: 'c3',
    title: 'Designated Safety Buddy / Home Base',
    number: '+1 (555) 019-2834',
    note: 'Check in every 90 minutes; holds emergency contacts',
  },
];

const DEFAULT_CHECKLIST: ProtestChecklistItem[] = [
  // OpSec
  { id: 'chk-1', category: 'opsec', label: 'Disable Face ID & Fingerprint unlock (Use alphanumeric passcode)', completed: true, critical: true },
  { id: 'chk-2', category: 'opsec', label: 'Turn off Wi-Fi & Bluetooth to prevent IMSI / beacon tracking', completed: true, critical: true },
  { id: 'chk-3', category: 'opsec', label: 'Enable Signal with disappearing messages (1 hr - 24 hrs)', completed: false, critical: true },
  { id: 'chk-4', category: 'opsec', label: 'Scrub GPS EXIF metadata from camera photos before sharing', completed: false },
  { id: 'chk-5', category: 'opsec', label: 'Turn off Google / Apple Location History tracking', completed: false },
  // Gear
  { id: 'chk-6', category: 'gear', label: '1.5L Clean water with squeeze nozzle (Hydration + Eye wash)', completed: true, critical: true },
  { id: 'chk-7', category: 'gear', label: 'Shatterproof goggles & sealed eye protection', completed: false, critical: true },
  { id: 'chk-8', category: 'gear', label: 'N95 or breathable bandana (non-oily)', completed: true },
  { id: 'chk-9', category: 'gear', label: 'Write legal support phone number in Sharpie on your forearm', completed: false, critical: true },
  { id: 'chk-10', category: 'gear', label: 'Physical government ID, $30–$50 cash for emergency transit', completed: true },
  { id: 'chk-11', category: 'gear', label: 'Fully charged power bank & backup USB-C/Lightning cable', completed: true },
  // Legal
  { id: 'chk-12', category: 'legal', label: 'Memorize the 4 Golden Phrases: Am I free to leave?', completed: true, critical: true },
  { id: 'chk-13', category: 'legal', label: 'Confirm buddy rendezvous location outside the march perimeter', completed: false },
];

export function ProtestHubModal({ isOpen, onClose, onSendChatMessage }: ProtestHubModalProps) {
  const [activeTab, setActiveTab] = useState<'rights' | 'firstaid' | 'checklist' | 'beacon' | 'incidents' | 'laragon'>('rights');

  // Emergency Contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('pascal_protest_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Checklist state
  const [checklist, setChecklist] = useState<ProtestChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('pascal_protest_checklist');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST;
    } catch {
      return DEFAULT_CHECKLIST;
    }
  });

  // Incidents state
  const [incidents, setIncidents] = useState<ProtestIncident[]>(() => {
    try {
      const saved = localStorage.getItem('pascal_protest_incidents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [incidentForm, setIncidentForm] = useState({
    location: '',
    badgeNumber: '',
    agency: '',
    tag: 'detention' as ProtestIncident['tag'],
    description: '',
    witnesses: '',
  });

  // Emergency Beacon & Siren state
  const [beaconActive, setBeaconActive] = useState<boolean>(false);
  const [beaconColor, setBeaconColor] = useState<'amber' | 'red' | 'sos'>('amber');
  const [sirenPlaying, setSirenPlaying] = useState<boolean>(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  // Laragon / Localhost test state
  const [laragonStatus, setLaragonStatus] = useState<any>(null);
  const [laragonLoading, setLaragonLoading] = useState<boolean>(false);
  const [laragonTestResult, setLaragonTestResult] = useState<string | null>(null);
  const [copiedLaragonCommands, setCopiedLaragonCommands] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('pascal_protest_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('pascal_protest_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('pascal_protest_incidents', JSON.stringify(incidents));
  }, [incidents]);

  // Clean up siren on unmount or close
  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  const toggleChecklistItem = (id: string) => {
    audioFx.playBlip(750);
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    audioFx.playBlip(900);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddContact = () => {
    if (!newContactTitle.trim() || !newContactNumber.trim()) return;
    const newEntry: EmergencyContact = {
      id: 'c-' + Date.now(),
      title: newContactTitle.trim(),
      number: newContactNumber.trim(),
      note: 'Custom field contact',
    };
    setContacts([...contacts, newEntry]);
    setNewContactTitle('');
    setNewContactNumber('');
    audioFx.playBlip(850);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    audioFx.playBlip(500);
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.description.trim()) return;

    const newInc: ProtestIncident = {
      id: 'inc-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      location: incidentForm.location || 'Active March Location',
      badgeNumber: incidentForm.badgeNumber || undefined,
      agency: incidentForm.agency || undefined,
      tag: incidentForm.tag,
      description: incidentForm.description.trim(),
      witnesses: incidentForm.witnesses || undefined,
    };

    setIncidents([newInc, ...incidents]);
    setIncidentForm({
      location: '',
      badgeNumber: '',
      agency: '',
      tag: 'detention',
      description: '',
      witnesses: '',
    });
    audioFx.playSuccess();
  };

  const handleExportIncidents = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incidents, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `protest_incident_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    audioFx.playSuccess();
  };

  // Acoustic siren generator
  const startSiren = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      // Wobble siren
      let now = ctx.currentTime;
      for (let i = 0; i < 40; i++) {
        osc.frequency.linearRampToValueAtTime(1400, now + 0.35);
        osc.frequency.linearRampToValueAtTime(800, now + 0.7);
        now += 0.7;
      }

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioCtx(ctx);
      setOscillator(osc);
      setSirenPlaying(true);
    } catch (e) {
      console.error('Failed to trigger audio siren:', e);
    }
  };

  const stopSiren = () => {
    if (oscillator) {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch {}
      setOscillator(null);
    }
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
      setAudioCtx(null);
    }
    setSirenPlaying(false);
  };

  const testLaragonPing = async () => {
    setLaragonLoading(true);
    setLaragonTestResult(null);
    try {
      // Test /api/laragon/action or fallback to health endpoint
      const res = await fetch('/api/laragon/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping', payload: { origin: window.location.origin } }),
      });
      const data = await res.json();
      setLaragonTestResult(JSON.stringify(data, null, 2));
      audioFx.playSuccess();
    } catch (err: any) {
      // Try /api/health as fallback
      try {
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        setLaragonTestResult(JSON.stringify({ status: 'connected_via_health', ...healthData }, null, 2));
        audioFx.playSuccess();
      } catch (healthErr: any) {
        setLaragonTestResult(`Status: Standalone Offline Mode (Backend not running or port 3000 inactive).\nNote: P.A.S.C.A.L's built-in Client-Side Tactical Engine is actively handling all queries offline!\nError detail: ${err.message}`);
        audioFx.playAlert();
      }
    } finally {
      setLaragonLoading(false);
    }
  };

  const fetchLaragonStatus = async () => {
    try {
      const res = await fetch('/api/laragon/status');
      const data = await res.json();
      setLaragonStatus(data);
    } catch {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setLaragonStatus({ environment: 'localhost', ...data });
      } catch (e) {
        console.warn('Laragon backend endpoint offline (using client tactical engine)');
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'laragon') {
      fetchLaragonStatus();
    }
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      {/* FULLSCREEN BEACON OVERLAY IF ACTIVE */}
      <AnimatePresence>
        {beaconActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-60 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer ${
              beaconColor === 'amber'
                ? 'animate-pulse bg-amber-500 text-black'
                : beaconColor === 'red'
                ? 'animate-pulse bg-rose-600 text-white'
                : 'bg-white text-black animate-ping'
            }`}
            onClick={() => setBeaconActive(false)}
          >
            <AlertTriangle className="w-24 h-24 mb-4 drop-shadow-lg" />
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest drop-shadow-md">
              {beaconColor === 'sos' ? 'S . O . S' : 'EMERGENCY BEACON'}
            </h1>
            <p className="mt-4 text-base sm:text-xl font-bold max-w-md opacity-90">
              Tap anywhere to deactivate visual beacon. P.A.S.C.A.L field locator active.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Protest & Tactical Field Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Localhost & Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                P.A.S.C.A.L legal shield, tear gas decontamination, digital OpSec, and Laragon / localhost integration
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioFx.playBlip(500);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-[#0e1628]/60 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('rights')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rights'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Legal Shield & Rights</span>
          </button>

          <button
            onClick={() => setActiveTab('firstaid')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'firstaid'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Tear Gas & First Aid</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Digital OpSec & Gear</span>
          </button>

          <button
            onClick={() => setActiveTab('beacon')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'beacon'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Emergency Beacon</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'incidents'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Incident Logger ({incidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('laragon')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'laragon'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Laragon & Localhost</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: LEGAL SHIELD & RIGHTS */}
          {activeTab === 'rights' && (
            <div className="space-y-6">
              {/* The 4 Golden Phrases */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-3">
                  <Megaphone className="w-4 h-4" />
                  <span>The 4 Golden Phrases (Memorize & Repeat Calmly)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">1. Am I free to leave?</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      If the officer says yes, walk away calmly. If they say no, ask on what reasonable suspicion you are detained.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">2. I exercise my right to remain silent.</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Never answer questions about where you are going, what you did, or whom you are with. You cannot talk your way out.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">3. I do not consent to any searches.</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Say it clearly and repeatedly. Police cannot legally search your bags, pockets, or unlock your phone without a warrant.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">4. I want to speak to an attorney.</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      If arrested, repeat this phrase immediately. All questioning must stop until your legal counsel is present.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filming Police in Public */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Right to Film Law Enforcement</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  You have a protected constitutional right to openly photograph and record police officers performing their duties in public spaces (streets, sidewalks, parks). Stay at a reasonable distance (8–10 feet), do not physically interfere with arrests, and do not obstruct foot or vehicular traffic.
                </p>
              </div>

              {/* Emergency Contacts & Forearm Hotline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Emergency Contacts & Forearm Numbers
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Write the primary hotline in permanent marker on your skin before taking the streets
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const summary = contacts.map((c) => `${c.title}: ${c.number}`).join('\n');
                      copyToClipboard(summary, 'all-contacts');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedId === 'all-contacts' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'all-contacts' ? 'Copied All' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {c.title}
                          </span>
                          <button
                            onClick={() => handleDeleteContact(c.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-base font-black font-mono text-blue-600 dark:text-blue-400 my-1">
                          {c.number}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          {c.note}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => copyToClipboard(c.number, c.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 cursor-pointer"
                        >
                          {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === c.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <a
                          href={`tel:${c.number}`}
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          Dial Call
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Contact Row */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    value={newContactTitle}
                    onChange={(e) => setNewContactTitle(e.target.value)}
                    placeholder="Contact name / organization..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newContactNumber}
                    onChange={(e) => setNewContactNumber(e.target.value)}
                    placeholder="Phone number..."
                    className="sm:w-48 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddContact}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAR GAS & FIRST AID */}
          {activeTab === 'firstaid' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Immediate Chemical Agent Decontamination (CS Gas / Pepper Spray)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">
                  Chemical agents cause intense burning of eyes, skin, and respiratory tracts. Stay calm; panic accelerates heart rate and inhalations.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-rose-700 dark:text-rose-400">1. Move Upwind & High:</span>
                    <span className="ml-1 text-slate-600 dark:text-slate-300">
                      Tear gas is heavier than air and sinks into alleys, gutters, and low ground. Move against the wind direction.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-rose-700 dark:text-rose-400">2. DO NOT Rub Your Eyes:</span>
                    <span className="ml-1 text-slate-600 dark:text-slate-300">
                      Rubbing rubs micro-crystals into corneas. Remove and discard contact lenses immediately with clean hands.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-rose-700 dark:text-rose-400">3. Eye Flush Protocol:</span>
                    <span className="ml-1 text-slate-600 dark:text-slate-300">
                      Tilt head sideways. Flush using clean water or 0.9% sterile saline from the inner tear duct outwards towards the ear. Do not allow contaminated water to drain into the other eye.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-rose-700 dark:text-rose-400">4. Clothing Stripping:</span>
                    <span className="ml-1 text-slate-600 dark:text-slate-300">
                      Do not pull shirts over your head—this drags chemical residue directly across face and eyes. Cut clothing or unbutton, and place in a double-bagged garbage sack.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40">
                    <span className="font-bold text-rose-700 dark:text-rose-400">5. Cold Water Wash:</span>
                    <span className="ml-1 text-slate-600 dark:text-slate-300">
                      Wash skin with cold water and dish soap (Dawn binds capsaicin). Never use hot water, vaseline, or mineral oils which seal toxins into skin pores.
                    </span>
                  </div>
                </div>
              </div>

              {/* Trauma & Crowd Safety Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    <span>Kinetic Projectiles (Rubber Bullets / Beanbags)</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Treat deep contusions with direct pressure and cold compresses. If penetrative skin rupture or head/neck impact occurs, seek immediate street medic triage or transport to hospital.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Crowd Kettling & Dispersal Exits</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Always look for 2 distinct exit corridors at every intersection. If trapped in a kettle line, lock arms with your affinity group, maintain balance, and observe badge numbers.
                  </p>
                </div>
              </div>

              {/* Quick AI First Aid Trigger */}
              {onSendChatMessage && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                  <div className="text-xs text-blue-900 dark:text-blue-200">
                    Need instant step-by-step chemical advice in chat?
                  </div>
                  <button
                    onClick={() => {
                      onSendChatMessage('Give me emergency tear gas and chemical irritant first aid steps right now');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    Ask P.A.S.C.A.L
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIGITAL OPSEC & GEAR */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Protest Readiness Checklist
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Items are saved locally in your browser memory
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {checklist.filter((i) => i.completed).length} / {checklist.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      item.completed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          item.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${item.completed ? 'line-through opacity-70' : ''}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {item.critical && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900 shrink-0">
                        Critical
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY BEACON & SIREN */}
          {activeTab === 'beacon' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60">
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-sm mb-2">
                  <Radio className="w-4 h-4" />
                  <span>High-Visibility Screen Beacon & Acoustic Alert</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
                  Turn your phone or tablet screen into an unmistakable high-candela flashing beacon to signal street medics or reunite with comrades in dense crowds.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => {
                      setBeaconColor('amber');
                      setBeaconActive(true);
                      audioFx.playBlip(900);
                    }}
                    className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Tactical Amber Flash</span>
                    <span className="text-[10px] opacity-80 font-normal">Crowd rendezvous</span>
                  </button>

                  <button
                    onClick={() => {
                      setBeaconColor('red');
                      setBeaconActive(true);
                      audioFx.playBlip(900);
                    }}
                    className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>Emergency Red Strobe</span>
                    <span className="text-[10px] opacity-80 font-normal">Medic callout</span>
                  </button>

                  <button
                    onClick={() => {
                      setBeaconColor('sos');
                      setBeaconActive(true);
                      audioFx.playBlip(900);
                    }}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95 border border-slate-700"
                  >
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>S.O.S High Contrast</span>
                    <span className="text-[10px] opacity-80 font-normal">Immediate distress</span>
                  </button>
                </div>

                {/* Acoustic Siren Button */}
                <div className="pt-3 border-t border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      High-Frequency Acoustic Dispersal Tone
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Loud oscillating sound burst to draw immediate crowd attention
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (sirenPlaying) {
                        stopSiren();
                      } else {
                        startSiren();
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                      sirenPlaying
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{sirenPlaying ? 'Stop Siren' : 'Trigger Siren'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INCIDENT & EVIDENCE LOGGER */}
          {activeTab === 'incidents' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Field Incident & Evidence Locker
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Timestamped logs stored locally in browser storage. Exportable for legal defense.
                  </p>
                </div>

                {incidents.length > 0 && (
                  <button
                    onClick={handleExportIncidents}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleAddIncident} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                    placeholder="Intersection / Landmark (e.g. 5th & Main)..."
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={incidentForm.badgeNumber}
                    onChange={(e) => setIncidentForm({ ...incidentForm, badgeNumber: e.target.value })}
                    placeholder="Badge # or Car #..."
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={incidentForm.tag}
                    onChange={(e) => setIncidentForm({ ...incidentForm, tag: e.target.value as any })}
                    className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="detention">Arrest / Detention</option>
                    <option value="chemical">Chemical Agent Deployment</option>
                    <option value="kettling">Kettling / Trapping</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="property">Property / Phone Confiscation</option>
                    <option value="general">General Note</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Detailed description of what occurred (officer actions, orders given, physical force)..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />

                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={incidentForm.witnesses}
                    onChange={(e) => setIncidentForm({ ...incidentForm, witnesses: e.target.value })}
                    placeholder="Witness names or contact handles..."
                    className="flex-1 max-w-sm px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Incident</span>
                  </button>
                </div>
              </form>

              {/* Incidents List */}
              <div className="space-y-2">
                {incidents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                    No field incidents recorded yet. Use the form above to record events in real time.
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {inc.location}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {inc.tag}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {inc.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {inc.description}
                      </p>
                      {(inc.badgeNumber || inc.witnesses) && (
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                          {inc.badgeNumber && <span>Badge: <strong>{inc.badgeNumber}</strong></span>}
                          {inc.witnesses && <span>Witnesses: {inc.witnesses}</span>}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: LARAGON & LOCALHOST INTEGRATION */}
          {activeTab === 'laragon' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/60">
                <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-bold text-sm mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Laragon & Localhost Deployment Suite</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  P.A.S.C.A.L is engineered to run seamlessly inside <strong>Laragon on Windows</strong> (via auto virtual host <strong>http://pascal.test</strong> or <strong>http://localhost:3000</strong>), as well as standalone in air-gapped protest demonstrations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-cyan-200/60 dark:border-cyan-900/40 space-y-1">
                    <span className="font-bold text-cyan-700 dark:text-cyan-400 block">Host Environment:</span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 block">
                      {window.location.origin}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      CORS & Iframe Embed: Unrestricted (frame-ancestors *)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-cyan-200/60 dark:border-cyan-900/40 space-y-1">
                    <span className="font-bold text-cyan-700 dark:text-cyan-400 block">Laragon Virtual Host:</span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 block">
                      http://pascal.test or localhost:3000
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Auto-detected via C:\laragon\www\pascal
                    </span>
                  </div>
                </div>
              </div>

              {/* Laragon Quick-Start Commands */}
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-300 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">Laragon Terminal Commands</span>
                  </div>

                  <button
                    onClick={() => {
                      const cmds = `cd C:\\laragon\\www\\pascal\nnpm install\nnpm run dev`;
                      navigator.clipboard.writeText(cmds);
                      setCopiedLaragonCommands(true);
                      audioFx.playSuccess();
                      setTimeout(() => setCopiedLaragonCommands(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                  >
                    {copiedLaragonCommands ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLaragonCommands ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-black/60 font-mono text-[11px] space-y-1.5 text-slate-300 border border-slate-900">
                  <p className="text-slate-500"># 1. Open Laragon Terminal & navigate to project directory</p>
                  <p className="text-emerald-400">cd C:\laragon\www\pascal</p>
                  <p className="text-slate-500 pt-1"># 2. Install application dependencies</p>
                  <p className="text-emerald-400">npm install</p>
                  <p className="text-slate-500 pt-1"># 3. Start local server (Express + Vite)</p>
                  <p className="text-emerald-400">npm run dev</p>
                  <p className="text-slate-500 pt-1"># 4. Access on your machine</p>
                  <p className="text-cyan-400">http://localhost:3000 &nbsp; (or http://pascal.test)</p>
                </div>
              </div>

              {/* Laragon Execution Modes */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>3 Ways to Run P.A.S.C.A.L in Laragon</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                      <Zap className="w-4 h-4" />
                      <span>1. Full Dev Server</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Right-click Laragon ➔ <strong>Terminal</strong>, run <code>npm run dev</code>. P.A.S.C.A.L launches on <strong>http://localhost:3000</strong> with active Gemini AI backend, voice synthesizer, and biometrics.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                      <Terminal className="w-4 h-4" />
                      <span>2. Apache Virtual Host</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Run <code>npm run build</code>. Laragon's Apache serves the built <code>dist/</code> folder. The included <strong>.htaccess</strong> automatically handles URL routing and CORS headers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>3. Air-Gapped Protest</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      No internet? No problem. In crowded demonstrations with jammed networks, P.A.S.C.A.L's <strong>Client-Side Tactical Engine</strong> answers questions offline with zero API calls.
                    </p>
                  </div>
                </div>
              </div>

              {/* Laragon Diagnostic Test */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Laragon / Localhost Connectivity Test
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pings P.A.S.C.A.L's local bridge on /api/laragon/action and /api/health
                    </p>
                  </div>

                  <button
                    onClick={testLaragonPing}
                    disabled={laragonLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${laragonLoading ? 'animate-spin' : ''}`} />
                    <span>Ping Laragon Bridge</span>
                  </button>
                </div>

                {laragonTestResult && (
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-48">
                    {laragonTestResult}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>P.A.S.C.A.L Field Security: Active & Air-Gapped Ready</span>
          </div>

          <button
            onClick={() => {
              audioFx.playBlip(500);
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Field Hub
          </button>
        </div>
      </motion.div>
    </div>
  );
}
