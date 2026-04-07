"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_SHALAT_FARDHU = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
const DEFAULT_SHALAT_SUNNAH = [
  "Tahajjud",
  "Dhuha",
  "Rawatib Qabliyah Subuh",
  "Rawatib Ba'diyah Dzuhur",
  "Rawatib Qabliyah Dzuhur",
  "Rawatib Ba'diyah Maghrib",
  "Rawatib Ba'diyah Isya",
];
const DEFAULT_CHECKLIST_ITEMS = [
  "Berpakaian rapi & menutup aurat",
  "Bertutur kata sopan",
  "Menghormati guru & orang tua",
  "Tidak berkata kasar/kotor",
  "Menjaga kebersihan lingkungan",
  "Membantu teman yang membutuhkan",
  "Tidak mencontek saat ujian",
  "Mengerjakan PR/tugas tepat waktu",
];

const GRADE_MAPPING: Record<string, string> = {
  AL_KINDI: "KELAS_7",
  AL_KHAWARIZMI: "KELAS_7",
  IBNU_KHOLDUN: "KELAS_8",
  IBNU_SINA: "KELAS_8",
  IBNU_AL_HAYTAM: "KELAS_9",
  IBNU_RUSYD: "KELAS_9",
};

const KELAS_DISPLAY: Record<string, string> = {
  AL_KINDI: "Al Kindi",
  AL_KHAWARIZMI: "Al Khawarizmi",
  IBNU_KHOLDUN: "Ibnu Kholdun",
  IBNU_SINA: "Ibnu Sina",
  IBNU_AL_HAYTAM: "Ibnu Al Haytam",
  IBNU_RUSYD: "Ibnu Rusyd",
};

export default function FormIbadahPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [shalatFardhu, setShalatFardhu] = useState<string[]>([]);
  const [shalatSunnah, setShalatSunnah] = useState<string[]>([]);
  const [tilawah, setTilawah] = useState("");
  const [murojaah, setMurojaah] = useState("");
  const [sedekah, setSedekah] = useState<boolean | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [goodDeeds, setGoodDeeds] = useState("");
  const [improvement, setImprovement] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [existingReport, setExistingReport] = useState(false);

  // Dynamic questions state
  const [questions, setQuestions] = useState({
    fardhu: DEFAULT_SHALAT_FARDHU,
    sunnah: DEFAULT_SHALAT_SUNNAH,
    checklist: DEFAULT_CHECKLIST_ITEMS,
  });

  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      // Ensure we have the user class first
      if (!session?.user?.class) return;
      const userClass = session.user.class;
      const userGrade = GRADE_MAPPING[userClass] || "KELAS_7";

      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setQuestions({
            fardhu: data[`${userGrade}_SHALAT_FARDHU`] || DEFAULT_SHALAT_FARDHU,
            sunnah: data[`${userGrade}_SHALAT_SUNNAH`] || DEFAULT_SHALAT_SUNNAH,
            checklist: data[`${userGrade}_CHECKLIST_ITEMS`] || DEFAULT_CHECKLIST_ITEMS,
          });
        }
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, [session]);

  // Check online status
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    handleStatus();
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  // Set today as max date
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load existing report for the selected date
  useEffect(() => {
    if (session?.user?.id && date) {
      loadExistingReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, session?.user?.id]);

  const loadExistingReport = async () => {
    try {
      const res = await fetch(`/api/reports?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setExistingReport(true);
          const r = data.report;
          setShalatFardhu(r.shalat?.fardhu || []);
          setShalatSunnah(r.shalat?.sunnah || []);
          setTilawah(r.tilawah || "");
          setMurojaah(r.murojaah || "");
          setSedekah(r.sedekah);
          setChecklist(r.checklist || []);
          setGoodDeeds(r.goodDeeds || "");
          setImprovement(r.improvement || "");
          setKnowledge(r.knowledge || "");
          setNotes(r.notes || "");
        } else {
          resetForm();
        }
      }
    } catch {
      // ignore
    }
  };

  const resetForm = () => {
    setExistingReport(false);
    setShalatFardhu([]);
    setShalatSunnah([]);
    setTilawah("");
    setMurojaah("");
    setSedekah(null);
    setChecklist([]);
    setGoodDeeds("");
    setImprovement("");
    setKnowledge("");
    setNotes("");
  };

  const toggleCheckbox = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (date > todayStr) {
      showToast("error", "Tidak bisa mengisi laporan untuk tanggal mendatang");
      return;
    }

    if (shalatFardhu.length === 0 && !tilawah && !murojaah && !sedekah && checklist.length === 0) {
      showToast("warning", "Mohon isi setidaknya satu aktivitas ibadah");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shalat: { fardhu: shalatFardhu, sunnah: shalatSunnah },
          tilawah,
          murojaah,
          sedekah: sedekah ?? false,
          checklist,
          goodDeeds,
          improvement,
          knowledge,
          notes,
        }),
      });

      if (res.ok) {
        setExistingReport(true);
        showToast(
          "success",
          existingReport
            ? "Laporan berhasil diperbarui! ✨"
            : "Laporan berhasil disimpan! Jazakallahu Khairan 🤲"
        );
      } else {
        const data = await res.json();
        showToast("error", data.error || "Gagal menyimpan laporan");
      }
    } catch {
      showToast("error", "Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) return null;

  const userName = session.user.name;
  const userClass = KELAS_DISPLAY[session.user.class] || session.user.class;
  const completedFardhu = shalatFardhu.length;

  return (
    <div className="min-h-screen islamic-pattern pb-8">
      {/* Offline Banner */}
      {isOffline && (
        <div className="sticky top-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
          <span>⚠️</span> Anda sedang offline. Menjalankan dalam mode terbatas.
        </div>
      )}

      {/* Header */}
      <header className="gradient-header text-white px-4 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 5C25.15 5 5 25.15 5 50s20.15 45 45 45c7.48 0 14.54-2.04 20.6-5.56C58.27 82.34 50 69.78 50 55.5S58.27 28.66 70.6 21.56C64.54 18.04 57.48 16 50 16z" />
            <circle cx="75" cy="20" r="5" opacity="0.6" />
          </svg>
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Kembali ke Dashboard"
              >
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold">📖 Ibadah Planner</h1>
                <p className="text-emerald-100 text-xs mt-0.5">
                  SMP Islam Modern Al Fakhir
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-emerald-100 hover:text-white text-sm flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Keluar
            </button>
          </div>

          {/* User Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{userName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-emerald-100 text-sm">
                  Kelas {userClass}
                </span>
                <span className="text-emerald-200/50">•</span>
                <span className="text-emerald-100 text-sm">
                  NIS: {session.user.nis}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{completedFardhu}/5</p>
              <p className="text-emerald-100 text-xs mt-1">Shalat Fardhu</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{shalatSunnah.length}</p>
              <p className="text-emerald-100 text-xs mt-1">Shalat Sunnah</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div className="glass-card p-5 animate-fade-in">
            <label className="text-sm font-semibold text-primary-800 mb-3 flex items-center gap-2">
              <span className="text-lg">📅</span> Tanggal
              {existingReport && (
                <span className="badge badge-green ml-auto">
                  Data tersimpan
                </span>
              )}
            </label>
            <input
              type="date"
              id="report-date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="form-input text-emerald-900 font-bold"
            />
          </div>

          {/* Shalat Fardhu */}
          <div className="glass-card p-5 animate-fade-in">
            <label className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
              <span className="text-lg">🕌</span> Shalat Fardhu
              <span className="badge badge-green ml-auto">
                {completedFardhu}/5
              </span>
            </label>
            <div className="space-y-2">
              {questions.fardhu.map((shalat) => (
                <label
                  key={shalat}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={shalatFardhu.includes(shalat)}
                    onChange={() =>
                      toggleCheckbox(shalat, shalatFardhu, setShalatFardhu)
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {shalat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Shalat Sunnah */}
          <div className="glass-card p-5 animate-fade-in">
            <label className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
              <span className="text-lg">✨</span> Shalat Sunnah
              <span className="badge badge-blue ml-auto">
                {shalatSunnah.length} selesai
              </span>
            </label>
            <div className="space-y-2">
              {questions.sunnah.map((shalat) => (
                <label
                  key={shalat}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={shalatSunnah.includes(shalat)}
                    onChange={() =>
                      toggleCheckbox(shalat, shalatSunnah, setShalatSunnah)
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {shalat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tilawah & Murojaah */}
          <div className="glass-card p-5 animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">📖</span> Tilawah Al-Qur&apos;an
                </label>
                <input
                  type="text"
                  value={tilawah}
                  onChange={(e) => setTilawah(e.target.value)}
                  className="form-input"
                  placeholder="Contoh: QS. Al-Baqarah ayat 1-10"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">🔁</span> Murojaah (Hafalan)
                </label>
                <input
                  type="text"
                  value={murojaah}
                  onChange={(e) => setMurojaah(e.target.value)}
                  className="form-input"
                  placeholder="Contoh: QS. An-Naba ayat 1-20"
                />
              </div>
            </div>
          </div>

          {/* Sedekah */}
          <div className="glass-card p-5 animate-fade-in">
            <label className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
              <span className="text-lg">💝</span> Sedekah Hari Ini
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-sm font-medium"
                style={{
                  borderColor: sedekah === true ? '#059669' : '#e2e8f0',
                  background: sedekah === true ? 'rgba(16, 185, 129, 0.05)' : 'white',
                }}
              >
                <input
                  type="radio"
                  name="sedekah"
                  className="custom-radio"
                  checked={sedekah === true}
                  onChange={() => setSedekah(true)}
                />
                <span>Ya, Alhamdulillah</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-sm font-medium"
                style={{
                  borderColor: sedekah === false ? '#059669' : '#e2e8f0',
                  background: sedekah === false ? 'rgba(16, 185, 129, 0.05)' : 'white',
                }}
              >
                <input
                  type="radio"
                  name="sedekah"
                  className="custom-radio"
                  checked={sedekah === false}
                  onChange={() => setSedekah(false)}
                />
                <span>Belum</span>
              </label>
            </div>
          </div>

          {/* Checklist Harian */}
          <div className="glass-card p-5 animate-fade-in">
            <label className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
              <span className="text-lg">✅</span> Checklist Akhlak Harian
              <span className="badge badge-gold ml-auto">
                {checklist.length}/{questions.checklist.length}
              </span>
            </label>
            <div className="space-y-2">
              {questions.checklist.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={checklist.includes(item)}
                    onChange={() =>
                      toggleCheckbox(item, checklist, setChecklist)
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Textarea fields */}
          <div className="glass-card p-5 animate-fade-in space-y-4">
            <div>
              <label className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                <span className="text-lg">🌟</span> Kebaikan Hari Ini
              </label>
              <textarea
                value={goodDeeds}
                onChange={(e) => setGoodDeeds(e.target.value)}
                className="form-input min-h-[80px] resize-y"
                placeholder="Ceritakan kebaikan yang kamu lakukan hari ini..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                <span className="text-lg">🎯</span> Perbaikan untuk Besok
              </label>
              <textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                className="form-input min-h-[80px] resize-y"
                placeholder="Apa yang ingin kamu perbaiki besok..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                <span className="text-lg">📚</span> Ilmu Agama yang Didapat
              </label>
              <textarea
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                className="form-input min-h-[80px] resize-y"
                placeholder="Ilmu agama apa yang kamu pelajari hari ini..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-primary-800 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span> Catatan Tambahan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input min-h-[80px] resize-y"
                placeholder="Catatan lainnya (opsional)..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4"
          >
            {loading ? (
              <>
                <div className="spinner w-5! h-5! border-2! border-white/30! border-t-white!"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  {existingReport ? "Perbarui Laporan" : "Simpan Laporan"}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.message}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in max-w-[90%] w-full sm:w-auto">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : toast.type === "warning"
                ? "bg-amber-50/90 border-amber-200 text-amber-800"
                : "bg-red-50/90 border-red-200 text-red-800"
            }`}
          >
            <span className="text-xl">
              {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "❌"}
            </span>
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
