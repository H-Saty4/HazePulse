import React from 'react';
import { BookOpen, X, CheckCircle2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      title: 'Prakiraan Hyperlocal 48 Jam',
      desc: 'Memproyeksikan konsentrasi PM2.5, PM10, NO2, dan CO hingga 48 jam ke depan berbasis perpaduan sensor Open-Meteo dan model regional CAMS.',
    },
    {
      title: 'Dosis Paparan Hirupan Personal',
      desc: 'Menghitung dosis partikulat riil yang masuk ke sistem pernapasan berdasarkan durasi luar ruang, filtrasi gedung, dan laju pernapasan aktivitas.',
    },
    {
      title: 'What-If Scenario Simulator',
      desc: 'Simulasikan skenario adveksi titik api kebakaran, pergeseran arah angin, atau pergeseran jam kegiatan luar ruangan.',
    },
    {
      title: 'Rute Bersih & Grid Spasial Mikro',
      desc: 'Temukan jalur alternatif dengan paparan minimal dan petakan variasi konsentrasi polutan per 1.5 km sel mikro wilayah.',
    },
    {
      title: 'Tanya Haze AI & Knowledge Memory',
      desc: 'Asisten kecerdasan buatan berbasis Gemini untuk kesehatan respirasi, sains atmosfer, serta kemampuan mengingat preferensi dan referensi Anda.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Panduan Sistem HazePulse
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Hyperlocal Environmental Intelligence Portal
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-slate-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <strong className="text-emerald-900 font-bold dark:text-emerald-300">
              Data Sensor Real-Time Grounded:
            </strong>
            <p className="mt-1 text-[11px] leading-relaxed">
              Seluruh data konsentrasi polutan dan cuaca diperbarui langsung dari sensor meteorologi Open-Meteo per koordinat GPS aktif. Anda dapat mengganti wilayah kapan saja melalui menu Cari Wilayah atau tombol GPS.
            </p>
          </div>

          <div className="space-y-2.5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{f.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 text-right dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
