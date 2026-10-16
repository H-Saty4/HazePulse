import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Zap,
  User,
  Loader2,
  Brain,
  Plus,
  Trash2,
  FileText,
  BookmarkCheck,
  Compass,
  MessageSquare,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { LocationInfo, PersonalExposureData, KnowledgeSource, UserMemoryItem } from '../types';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface TanyaHazeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationInfo;
  currentPm25: number;
  currentWind?: number;
  currentWindDir?: string;
  currentTemp?: number;
  currentHumidity?: number;
  indicativeScore?: number;
  currentAqi?: number;
  bestWindow?: string;
  peakWindow?: string;
  exposureData: PersonalExposureData;
}

const DEFAULT_MEMORIES: UserMemoryItem[] = [
  {
    id: 'mem-1',
    text: 'Suka berolahraga luar ruangan (jogging / jalan santai di pagi hari).',
    category: 'rutinitas',
    dateAdded: 'Otomatis',
  },
  {
    id: 'mem-2',
    text: 'Memperhatikan kesehatan saluran pernapasan keluarga dan ventilasi rumah.',
    category: 'kesehatan',
    dateAdded: 'Otomatis',
  },
];

const DEFAULT_SOURCES: KnowledgeSource[] = [
  {
    id: 'src-1',
    title: 'Standar Baku Mutu Udara Ambien WHO 2021',
    content:
      'WHO menetapkan pedoman kualitas udara tahunan PM2.5 tidak melebihi 5 µg/m³, dan rata-rata 24 jam tidak melebihi 15 µg/m³. Paparan jangka pendek di atas 35 µg/m³ mulai memicu gejala pada penderita asma dan penyakit kardiovaskular.',
    dateAdded: 'Bawaan Sistem',
  },
  {
    id: 'src-2',
    title: 'Efektivitas Filtrasi HEPA H13 & Masker N95/KF94',
    content:
      'Filter HEPA (High Efficiency Particulate Air) H13 memiliki efisiensi filtrasi 99.97% terhadap partikel aerosol berukuran 0.3 mikrometer (diameter partikel paling sulit disaring/MPPS). Masker medis biasa memiliki celah samping, sehingga respirator N95 atau KF94 jauh lebih disarankan saat AQI > 100.',
    dateAdded: 'Bawaan Sistem',
  },
];

export const TanyaHazeDrawer: React.FC<TanyaHazeDrawerProps> = ({
  isOpen,
  onClose,
  location,
  currentPm25,
  currentWind = 8,
  currentWindDir = 'Barat Daya',
  currentTemp = 28,
  currentHumidity = 74,
  currentAqi = 75,
  bestWindow = '09.00 — 11.00',
  peakWindow = '16.00 — 18.00',
  exposureData,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: `Halo! Saya HazePulse AI. Saya membaca langsung sensor atmosfer real-time di ${location.name} (PM2.5: ${currentPm25} µg/m³, US AQI: ${currentAqi}).\n\nSaya tidak hanya menjawab persoalan di layar, tetapi juga siap mendiskusikan fisiologi kesehatan pernapasan, sains atmosfer, air purifier, kebijakan emisi, perbandingan kota, serta belajar dari sumber dan catatan yang Anda berikan. Apa yang ingin Anda diskusikan?`,
        timestamp: 'Baru saja',
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // User Memory & Knowledge Base
  const [userMemory, setUserMemory] = useState<UserMemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('hazepulse_user_memory');
      return saved ? JSON.parse(saved) : DEFAULT_MEMORIES;
    } catch {
      return DEFAULT_MEMORIES;
    }
  });

  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(() => {
    try {
      const saved = localStorage.getItem('hazepulse_knowledge_sources');
      return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  });

  // Modal / Inputs for adding custom knowledge
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<'kesehatan' | 'rutinitas' | 'preferensi' | 'lokasi' | 'umum'>('kesehatan');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');

  // Persist memories & sources
  useEffect(() => {
    try {
      localStorage.setItem('hazepulse_user_memory', JSON.stringify(userMemory));
    } catch (e) {
      console.warn(e);
    }
  }, [userMemory]);

  useEffect(() => {
    try {
      localStorage.setItem('hazepulse_knowledge_sources', JSON.stringify(knowledgeSources));
    } catch (e) {
      console.warn(e);
    }
  }, [knowledgeSources]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Berapa batas aman PM2.5 menurut WHO?',
    'Kapan jam terbaik olahraga luar ruangan?',
    'Bagaimana cara kerja filter HEPA H13?',
    'Mengapa polusi udara sering pekat di malam hari?',
    'Apakah masker medis biasa ampuh menangkal PM2.5?',
    'Bagaimana perlindungan anak & balita saat udara buruk?',
  ];

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    const item: UserMemoryItem = {
      id: `mem-${Date.now()}`,
      text: newMemoryText.trim(),
      category: newMemoryCategory,
      dateAdded: new Date().toLocaleDateString('id-ID'),
    };
    setUserMemory((prev) => [item, ...prev]);
    setNewMemoryText('');
  };

  const handleDeleteMemory = (id: string) => {
    setUserMemory((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddSource = () => {
    if (!newSourceTitle.trim() || !newSourceContent.trim()) return;
    const item: KnowledgeSource = {
      id: `src-${Date.now()}`,
      title: newSourceTitle.trim(),
      content: newSourceContent.trim(),
      dateAdded: new Date().toLocaleDateString('id-ID'),
    };
    setKnowledgeSources((prev) => [item, ...prev]);
    setNewSourceTitle('');
    setNewSourceContent('');
    setIsAddingSource(false);
  };

  const handleDeleteSource = (id: string) => {
    setKnowledgeSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isLoading) return;

    // Check if user is sharing a personal fact (e.g. "saya punya asma", "saya tinggal di...")
    const lower = text.toLowerCase();
    if (lower.includes('saya punya') || lower.includes('saya ada') || lower.includes('saya penderita') || lower.includes('saya rutin')) {
      const autoMemory: UserMemoryItem = {
        id: `mem-auto-${Date.now()}`,
        text: text,
        category: lower.includes('asma') || lower.includes('alergi') ? 'kesehatan' : 'rutinitas',
        dateAdded: 'Dipelajari dari obrolan',
      };
      setUserMemory((prev) => [autoMemory, ...prev]);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            location: `${location.name} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`,
            pm25: currentPm25,
            aqi: currentAqi,
            status: currentPm25 > 55 ? 'Tidak Sehat' : currentPm25 > 35 ? 'Perlu Perhatian' : 'Sedang',
            temp: currentTemp,
            humidity: currentHumidity,
            wind: `${currentWind} km/j`,
            windDir: currentWindDir,
            exposureScore: exposureData.score,
            exposureLevel: exposureData.level,
            peakWindow,
            bestWindow,
          },
          userMemory,
          knowledgeSources,
          history: messages.slice(-6),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'Maaf, saya tidak dapat merespons saat ini.',
          timestamp: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Chat API returned an error');
      }
    } catch (err) {
      console.error(err);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Berdasarkan data sensor real-time di ${location.name} (PM2.5: ${currentPm25} µg/m³, US AQI: ${currentAqi}), kualitas udara berada dalam pantauan aktif.\n\n• Jam respirasi terbersih diproyeksikan pada rentang **${bestWindow}**.\n• Hindari olahraga luar ruang intensitas tinggi pada rentang **${peakWindow}**.\n\nJika Anda memiliki preferensi kesehatan khusus atau ingin saya mempelajari jurnal/artikel baru, Anda dapat menambahkannya di tab **"Memori & Sumber Belajar AI"** di atas!`,
        timestamp: 'Sekarang',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in-overlay"
    >
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl animate-drawer-in dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs dark:bg-slate-100 dark:text-slate-900">
              <Sparkles className="h-4 w-4 text-amber-400 dark:text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tanya Haze
                </h2>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Model Pengetahuan Terbuka
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono dark:text-slate-400">
                {location.name} · {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Tutup Tanya Haze"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Chat vs Learning Memory */}
        <div className="flex items-center border-b border-slate-200 bg-white px-4 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'chat'
                ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Percakapan Cerdas</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'knowledge'
                ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Brain className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Memori & Sumber Belajar</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {userMemory.length + knowledgeSources.length}
            </span>
          </button>
        </div>

        {activeTab === 'chat' ? (
          <>
            {/* Real-time Sensor Context Bar */}
            <div className="border-b border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    PM2.5: {currentPm25} µg/m³
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    AQI: <strong className="text-emerald-700 dark:text-emerald-400">{currentAqi}</strong>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {currentTemp}°C | {currentWind} km/j
                  </span>
                </div>
                <span className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300">
                  SENSOR LIVE
                </span>
              </div>
            </div>

            {/* Chat Conversation Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'ai' && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed transition-all ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div
                      className={`mt-1.5 text-right text-[9px] ${
                        m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white dark:bg-slate-700">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        HazePulse AI
                      </span>
                      <span>sedang menganalisis literatur sains & sensor...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Quick Suggestions & Input Box */}
            <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>EKSPLORASI TOPIK CERDAS</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Sains & Tindakan
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-slate-800"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mt-3">
                <textarea
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanyakan hal apa saja (kesehatan, sains, air purifier, kebijakan, perbandingan kota)..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 pr-12 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-40 shadow-xs"
                  aria-label="Kirim pertanyaan"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Enter kirim · Shift + Enter baris baru</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Brain className="h-3 w-3" />
                  Memori Pembelajaran Aktif
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Knowledge & Memory Tab */
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Mesin Pembelajaran & Pengetahuan AI
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Tanya Haze AI dapat belajar dari pertanyaan Anda, menyimpan preferensi kesehatan Anda, dan mengasimilasi dokumen/sumber baru yang Anda tambahkan ke dalam basis penalarannya.
              </p>
            </div>

            {/* Section 1: User Memories */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Memori & Preferensi Pengguna ({userMemory.length})
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fakta yang diingat AI tentang kondisi kesehatan dan kebiasaan Anda
                  </p>
                </div>
              </div>

              {/* Add Memory Input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  placeholder="Contoh: Saya memiliki riwayat asma / alergi dingin..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
                <select
                  value={newMemoryCategory}
                  onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  <option value="kesehatan">Kesehatan</option>
                  <option value="rutinitas">Rutinitas</option>
                  <option value="preferensi">Preferensi</option>
                  <option value="lokasi">Lokasi</option>
                </select>
                <button
                  onClick={handleAddMemory}
                  disabled={!newMemoryText.trim()}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Simpan</span>
                </button>
              </div>

              {/* Memory List */}
              <div className="mt-3 space-y-2">
                {userMemory.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start gap-2.5">
                      <BookmarkCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {mem.text}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          Kategori: <span className="capitalize">{mem.category}</span> · {mem.dateAdded}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Hapus memori"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Knowledge Sources */}
            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Dokumen & Sumber Belajar AI ({knowledgeSources.length})
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Artikel, regulasi, atau jurnal yang menjadi referensi penalaran AI
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingSource(!isAddingSource)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Sumber</span>
                </button>
              </div>

              {/* Add Source Form */}
              {isAddingSource && (
                <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50/50 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Unggah Sumber / Catatan Baru
                  </div>
                  <input
                    type="text"
                    value={newSourceTitle}
                    onChange={(e) => setNewSourceTitle(e.target.value)}
                    placeholder="Judul Dokumen / Sumber (misal: Studi Udara UI 2024)..."
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <textarea
                    rows={3}
                    value={newSourceContent}
                    onChange={(e) => setNewSourceContent(e.target.value)}
                    placeholder="Tempelkan ringkasan artikel, temuan penelitian, atau kutipan aturan di sini..."
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="mt-2.5 flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingSource(false)}
                      className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleAddSource}
                      disabled={!newSourceTitle.trim() || !newSourceContent.trim()}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Simpan Sumber
                    </button>
                  </div>
                </div>
              )}

              {/* Sources List */}
              <div className="mt-3 space-y-2.5">
                {knowledgeSources.map((src) => (
                  <div
                    key={src.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {src.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSource(src.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                        title="Hapus sumber"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1.5 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {src.content}
                    </p>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      Ditambahkan: {src.dateAdded}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
