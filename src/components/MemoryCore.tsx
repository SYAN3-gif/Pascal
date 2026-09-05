import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Search, Plus, Pin, Trash2, X, Check, Sparkles } from 'lucide-react';
import { MemoryNode } from '../types';
import { audioFx } from '../utils/audioFx';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryNode[];
  onAddMemory: (node: Omit<MemoryNode, 'id' | 'timestamp'>) => void;
  onDeleteMemory: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const INITIAL_MEMORIES: MemoryNode[] = [
  {
    id: 'mem-01',
    category: 'identity',
    title: 'Assistant Identity',
    content: 'P.A.S.C.A.L (Personal Automated System for Computing Assistance and Learning) is designed for polite, articulate, human-like dialogue and proactive computing assistance.',
    timestamp: '2026-08-18',
    importance: 'critical',
    synapses: [],
    pinned: true,
  },
  {
    id: 'mem-02',
    category: 'biometrics',
    title: 'Operator Profile',
    content: 'Authorized Operator: Yan (Chief Engineer). Voice profile calibrated with high confidence; facial biometrics authenticated.',
    timestamp: '2026-08-18',
    importance: 'high',
    synapses: [],
    pinned: true,
  },
  {
    id: 'mem-03',
    category: 'project',
    title: 'Interface Philosophy',
    content: 'Prioritize a clean, effortless Claude / ChatGPT conversational layout with intuitive voice synthesis, face ID biometrics, and gesture controls.',
    timestamp: '2026-08-18',
    importance: 'normal',
    synapses: [],
    pinned: false,
  },
  {
    id: 'mem-04',
    category: 'preference',
    title: 'Vocal Synthesis Tone',
    content: 'Articulate British English timbre with natural cadence, 1.05x pace, and calm responses.',
    timestamp: '2026-08-18',
    importance: 'normal',
    synapses: [],
    pinned: false,
  },
];

export const MemoryCore: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onTogglePin,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryNode['category']>('directive');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'identity', label: 'Identity' },
    { id: 'biometrics', label: 'Biometrics' },
    { id: 'project', label: 'Projects' },
    { id: 'preference', label: 'Preferences' },
  ];

  const filtered = memories.filter((m) => {
    const matchCat = selectedCat === 'all' || m.category === selectedCat;
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    audioFx.playSuccess();
    onAddMemory({
      title: title.trim(),
      content: content.trim(),
      category,
      importance: 'normal',
      synapses: [],
      pinned: false,
    });

    setTitle('');
    setContent('');
    setIsAdding(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-white max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Memory & Knowledge Vault</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                What Pascal remembers about you and your preferences
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

        {/* Search & New Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => {
              audioFx.playBlip(800);
              setIsAdding(!isAdding);
            }}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                audioFx.playBlip(700);
                setSelectedCat(c.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedCat === c.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Add Memory Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSave}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">New Memory Entry</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                required
                placeholder="Title (e.g. Project Specs, Preferred Tone)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none"
              />

              <textarea
                required
                rows={2}
                placeholder="What should Pascal remember?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                >
                  <option value="directive">Directive</option>
                  <option value="identity">Identity</option>
                  <option value="biometrics">Biometrics</option>
                  <option value="project">Project</option>
                  <option value="preference">Preference</option>
                </select>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 cursor-pointer"
                >
                  Save Memory
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-80">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No memories found matching your search.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1 group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        audioFx.playBlip(700);
                        onTogglePin(item.id);
                      }}
                      className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer ${
                        item.pinned ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`}
                      title={item.pinned ? 'Pinned' : 'Pin memory'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        audioFx.playBlip(400);
                        onDeleteMemory(item.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>{memories.length} active memory memories</span>
          <button
            onClick={() => {
              audioFx.playSuccess();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
