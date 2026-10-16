import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '5mb' }));

// Initialize Gemini SDK if API key exists
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// 1. Combined Open-Meteo Air Quality & Weather API Proxy (Real-time)
app.get('/api/air-quality', async (req: Request, res: Response) => {
  const { lat = '-6.2088', lon = '106.8456' } = req.query;
  try {
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,us_aqi,ozone,sulphur_dioxide&hourly=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,us_aqi&timezone=auto&forecast_days=3`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_days=3`;

    const [aqRes, weatherRes] = await Promise.all([
      fetch(airQualityUrl),
      fetch(weatherUrl),
    ]);

    if (!aqRes.ok) {
      throw new Error(`Open-Meteo Air Quality returned status ${aqRes.status}`);
    }

    const aqData = await aqRes.json();
    let weatherData = null;
    if (weatherRes.ok) {
      weatherData = await weatherRes.json();
    }

    res.json({
      airQuality: aqData,
      weather: weatherData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching Open-Meteo live data:', error.message);
    res.status(500).json({ error: 'Failed to fetch Open-Meteo data', details: error.message });
  }
});

// 2. Geocoding Search Proxy (Open-Meteo Geocoding)
app.get('/api/geocode/search', async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=10&language=id&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Geocoding search failed' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reverse Geocode Proxy (Nominatim with proper User-Agent)
app.get('/api/geocode/reverse', async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HazePulse-Environmental-App/2.0 (contact@hazepulse.org)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Reverse geocode failed' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Tanya Haze AI Smart Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, context, history, userMemory, knowledgeSources } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format Knowledge Sources & User Memory for the AI context
    const memorySection = Array.isArray(userMemory) && userMemory.length > 0
      ? `\n=== MEMORI & FAKTA PERSONAL PENGGUNA (YANG TELAH DIPELAJARI) ===\n${userMemory
          .map((m: any, idx: number) => `${idx + 1}. [${m.category || 'Info'}]: ${m.text}`)
          .join('\n')}\n`
      : '';

    const sourcesSection = Array.isArray(knowledgeSources) && knowledgeSources.length > 0
      ? `\n=== SUMBER PENGETAHUAN & REFERENSI TAMBAHAN DARI PENGGUNA ===\n${knowledgeSources
          .map((s: any, idx: number) => `Sumber #${idx + 1} (${s.title}):\n"${s.content}"`)
          .join('\n\n')}\n`
      : '';

    const systemPrompt = `Anda adalah "HazePulse AI" (Tanya Haze), asisten kecerdasan lingkungan, sains atmosfer, kesehatan respirasi, dan analisis kualitas udara canggih.

Kemampuan & Peran Utama Anda:
1. Luas & Pintar: Jangan batasi jawaban hanya pada apa yang ada di tampilan dashboard. Anda memiliki wawasan luas mencakup kedokteran paru/pulmonologi, pediatri, fisiologi olahraga, kimia aerosol (PM2.5, PM10, O3, NO2, SO2), fisika inversi termal malam hari, teknologi air purifier (HEPA, CADR, activated carbon), regulasi emisi (Euro, KLHK, WHO, US EPA), hingga perbandingan lintas kota/negara.
2. Pembelajaran & Memori: Anda secara aktif memanfaatkan dan menghargai memori preferensi pengguna (seperti riwayat asma, rutinitas olahraga, anak/lansia di rumah) serta sumber dokumen/artikel yang diunggah pengguna.
3. Hyperlocal Real-time Grounding: Hubungkan jawaban Anda dengan kondisi sensor cuaca & atmosfer real-time pengguna saat ini.
4. Solutif & Beraksi Nyata: Berikan rekomendasi jam olahraga luar ruang, jam ventilasi jendela buka/tutup, jenis masker (N95/KF94), rute minim polusi, dan mitigasi indoor.

Kondisi Sensor Atmosfer & Cuaca Saat Ini di Lokasi Pengguna:
- Lokasi Terpantau: ${context?.location || 'Lokasi Aktif'}
- Konsentrasi PM2.5 Aktual: ${context?.pm25} µg/m³
- US AQI Index Aktual: ${context?.aqi || 'Otomatis'}
- Status Kualitas Udara: ${context?.status || 'Sedang'}
- Suhu: ${context?.temp}°C | Kelembaban: ${context?.humidity || 75}%
- Angin: ${context?.wind} (${context?.windDir || 'Barat Daya'})
- Prakiraan Jendela Terbaik (Polusi Terendah): ${context?.bestWindow || '09.00 — 11.00'}
- Prakiraan Puncak Paparan: ${context?.peakWindow || '16.00 — 18.00'}
- Skor Dosis Paparan Personal: ${context?.exposureScore || 45}/100 (${context?.exposureLevel || 'Sedang'})
${memorySection}
${sourcesSection}
Panduan Gaya Respon:
- Gunakan bahasa Indonesia yang ramah, berwibawa, lugas, mudah dipahami, berstruktur rapi dengan poin-poin tebal jika diperlukan.
- Jika pengguna bertanya di luar web (misal: "efek PM2.5 pada anak", "cara kerja HEPA filter", "kenapa Jakarta sering polusi", "apakah tanaman bisa menyerap partikel mikro"), jawablah secara mendalam, ilmiah, dan praktis!
- Jika relevan, sertakan saran tindak lanjut singkat.`;

    if (aiClient) {
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Try gemini-3.8-flash with fast 3.5s timeout, falling back instantly if unavailable
      let replyText: string | null = null;
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Model call timeout')), 3500)
        );
        const generatePromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);
        if (response?.text) {
          replyText = response.text;
        }
      } catch (modelErr: any) {
        console.warn('Gemini model attempt warning:', modelErr.message);
      }

      if (replyText) {
        return res.json({ reply: replyText });
      }

      if (replyText) {
        return res.json({ reply: replyText });
      }
    }

    // High intelligence offline fallback with contextual learning support
    const reply = generateSmartFallbackReply(message, context, userMemory, knowledgeSources);
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const fallback = generateSmartFallbackReply(
      req.body?.message || '',
      req.body?.context,
      req.body?.userMemory,
      req.body?.knowledgeSources
    );
    return res.json({ reply: fallback });
  }
});

function generateSmartFallbackReply(
  message: string,
  context: any,
  userMemory: any[] = [],
  knowledgeSources: any[] = []
): string {
  const q = message.toLowerCase();
  const pm25 = context?.pm25 || '24.2';
  const aqi = context?.aqi || '78';
  const bestWindow = context?.bestWindow || '09.00 — 11.00';
  const peakWindow = context?.peakWindow || '16.00 — 18.00';
  const loc = context?.location || 'lokasi Anda';

  // Check if any user custom source or memory matches
  let memoryMention = '';
  if (Array.isArray(userMemory) && userMemory.length > 0) {
    const matched = userMemory.find(m => q.includes(m.category) || q.includes('saya'));
    if (matched) {
      memoryMention = `\n*(Mengingat preferensi Anda: "${matched.text}")*`;
    }
  }

  if (q.includes('lari') || q.includes('olahraga') || q.includes('jogging') || q.includes('sport') || q.includes('sepeda')) {
    return `🏃 **Panduan Beraktivitas Luar Ruangan di ${loc}**\n\n` +
      `Berdasarkan data sensor terkini (PM2.5: **${pm25} µg/m³**, US AQI: **${aqi}**):\n\n` +
      `• **Waktu Terbaik:** Pukul **${bestWindow}**. Pada rentang ini, turbulensi atmosfer dan radiasi matahari membantu pengenceran akumulasi aerosol.\n` +
      `• **Waktu Dihindari:** Pukul **${peakWindow}** akibat kompresi batas atmosfer (inversi malam) dan lonjakan emisi transportasi.\n` +
      `• **Laju Ventilasi:** Olahraga intensitas tinggi meningkatkan volume hirupan udara 5–8x lipat. Jika terpaksa berolahraga saat udara kurang sehat, pertimbangkan ruangan indoor berfilter atau kenakan respirator bersertifikasi (KF94/KN95).${memoryMention}`;
  }

  if (q.includes('jendela') || q.includes('ventilasi') || q.includes('udara masuk') || q.includes('purifier') || q.includes('ac')) {
    return `🪟 **Strategi Sirkulasi Udara & Pengendalian Kualitas Indoor:**\n\n` +
      `1. **Buka Jendela:** Paling aman pada pukul **${bestWindow}**. Hindari membuka ventilasi lebar-lebar antara pukul **17.00 hingga 06.00 pagi** saat polutan permukaan sedang pekat akibat inversi suhu.\n` +
      `2. **Air Purifier:** Pastikan menggunakan filter HEPA kelas H13 yang mampu menangkap partikel hingga 0.3 mikron dengan efisiensi 99.97%. Nyalakan pada level otomatis terutama saat sore dan malam.\n` +
      `3. **AC Split:** Ingat bahwa AC split standar hanya mendinginkan dan mensirkulasikan udara dalam ruangan, bukan memasukkan oksigen baru dari luar.${memoryMention}`;
  }

  if (q.includes('anak') || q.includes('bayi') || q.includes('lansia') || q.includes('asma') || q.includes('hamil') || q.includes('kesehatan')) {
    return `🩺 **Perlindungan Kesehatan Respirasi untuk Kelompok Rentan:**\n\n` +
      `Partikulat PM2.5 memiliki diameter < 2.5 mikrometer—jauh lebih kecil dari diameter rambut manusia (50–70 µm). Partikel ini dapat menembus alveoli dan memasuki sirkulasi darah.\n\n` +
      `• **Untuk Anak & Bayi:** Laju pernapasan per kg berat badan anak 2x lebih cepat dari orang dewasa. Batasi aktivitas bermain luar ruang saat PM2.5 > 35 µg/m³.\n` +
      `• **Untuk Penderita Asma / Alergi:** Selalu siapkan inhaler pencegah dan periksa indeks AQI sebelum bepergian.\n` +
      `• **Penggunaan Masker:** Masker kain atau medis biasa tidak menyaring PM2.5 secara efektif. Gunakan masker particulate berstandar N95, KN95, atau KF94 dengan kerapatan tepi yang pas di wajah.${memoryMention}`;
  }

  if (q.includes('kenapa') || q.includes('faktor') || q.includes('penyebab') || q.includes('inversi') || q.includes('malam') || q.includes('hujan')) {
    return `🔬 **Analisis Ilmiah Dinamika Polusi Atmosfer:**\n\n` +
      `Mengapa kualitas udara berubah-ubah sepanjang hari di ${loc}?\n\n` +
      `1. **Nocturnal Temperature Inversion (Inversi Termal Malam):** Di siang hari, tanah hangat memicu konveksi udara ke atas. Di malam hari, pelepasan radiasi inframerah mendinginkan permukaan tanah, menciptakan lapisan udara dingin terperangkap di bawah lapisan hangat. Polusi terkunci dekat tanah.\n` +
      `2. **Kecepatan Angin & Stagnasi:** Kecepatan angin di bawah 5 km/j menyebabkan massa udara mandek dan menumpuk emisi lokal.\n` +
      `3. **Reaksi Fotokimia:** Sinar UV memicu reaksi antara gas NOx dan Senyawa Organik Terbang (VOC) membentuk Ozon Permukaan (O3) dan aerosol sekunder.\n` +
      `4. **Efek Wet Deposition (Hujan):** Hujan deras membersihkan aerosol tersuspensi, sementara gerimis ringan kadang hanya meningkatkan kelembaban tanpa meluruhkan partikulat secara tuntas.`;
  }

  return `Halo! Saya HazePulse AI, siap membantu Anda dengan data sensor real-time di **${loc}** (PM2.5: **${pm25} µg/m³**, US AQI: **${aqi}**).\n\n` +
    `Anda dapat bertanya bebas tentang:\n` +
    `• **Kesehatan & Pencegahan:** Dampak PM2.5 pada paru, kehamilan, anak, asma, atau efektivitas filter HEPA.\n` +
    `• **Aktivitas & Rutinitas:** Jadwal lari pagi teraman, waktu buka ventilasi, atau jalur perjalanan bersih.\n` +
    `• **Sains & Regulasi:** Dinamika atmosfer, standar baku mutu WHO/KLHK, sensor udara, atau perbandingan polusi lintas daerah.\n` +
    `• **Pembelajaran & Catatan:** Anda juga dapat menyimpan riwayat kesehatan Anda atau mengunggah catatan sumber di menu Memori AI!${memoryMention}`;
}

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`HazePulse server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
