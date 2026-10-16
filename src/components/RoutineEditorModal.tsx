import React, { useState } from 'react';
import { X, Plus, Trash2, Clock } from 'lucide-react';
import { UserActivity } from '../types';

interface RoutineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: UserActivity[];
  onSaveActivities: (updated: UserActivity[]) => void;
}

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  isOpen,
  onClose,
  activities,
  onSaveActivities,
}) => {
  const [localActivities, setLocalActivities] = useState<UserActivity[]>(activities);

  if (!isOpen) return null;

  const handleAddActivity = () => {
    const newAct: UserActivity = {
      id: `act-${Date.now()}`,
      title: 'Aktivitas Baru',
      startTime: '10.00',
      endTime: '11.00',
      durationMinutes: 45,
      isOutdoor: true,
      locationName: 'Taman / Luar Ruang',
      exertionLevel: 'sedang',
      score: 15,
    };
    setLocalActivities([...localActivities, newAct]);
  };

  const handleRemove = (id: string) => {
    setLocalActivities(localActivities.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    onSaveActivities(localActivities);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Atur Jadwal & Rutinitas Harian
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hitung dosis paparan aerosol berdasarkan jam dan laju respirasi Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {localActivities.map((act) => (
            <div
              key={act.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={act.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalActivities(
                      localActivities.map((a) =>
                        a.id === act.id ? { ...a, title: val } : a
                      )
                    );
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />

                <button
                  onClick={() => handleRemove(act.id)}
                  className="text-rose-600 hover:text-rose-700 p-1 dark:text-rose-400"
                  title="Hapus aktivitas"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Jam Mulai</label>
                  <input
                    type="text"
                    value={act.startTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalActivities(
                        localActivities.map((a) =>
                          a.id === act.id ? { ...a, startTime: val } : a
                        )
                      );
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Durasi (mnt)</label>
                  <input
                    type="number"
                    value={act.durationMinutes}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLocalActivities(
                        localActivities.map((a) =>
                          a.id === act.id ? { ...a, durationMinutes: val } : a
                        )
                      );
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Lingkungan</label>
                  <select
                    value={act.isOutdoor ? 'outdoor' : 'indoor'}
                    onChange={(e) => {
                      const isOut = e.target.value === 'outdoor';
                      setLocalActivities(
                        localActivities.map((a) =>
                          a.id === act.id ? { ...a, isOutdoor: isOut } : a
                        )
                      );
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="outdoor">Luar Ruang</option>
                    <option value="indoor">Dalam Ruang</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Intensitas</label>
                  <select
                    value={act.exertionLevel}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setLocalActivities(
                        localActivities.map((a) =>
                          a.id === act.id ? { ...a, exertionLevel: val } : a
                        )
                      );
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="rendah">Rendah (Duduk)</option>
                    <option value="sedang">Sedang (Jalan)</option>
                    <option value="berat">Berat (Lari/Sepeda)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddActivity}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Aktivitas Lain</span>
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
          >
            Simpan & Hitung Ulang
          </button>
        </div>
      </div>
    </div>
  );
};
