"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_SHALAT_FARDHU = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
const SHALAT_ICONS: Record<string, string> = {
  Subuh: "🌄", Dzuhur: "☀️", Ashar: "🌤️", Maghrib: "🌅", Isya: "🌙",
};
const DEFAULT_SHALAT_SUNNAH = [
  "Tahajjud", "Dhuha", "Rawatib Qabliyah Subuh",
  "Rawatib Ba'diyah Dzuhur", "Rawatib Qabliyah Dzuhur",
  "Rawatib Ba'diyah Maghrib", "Rawatib Ba'diyah Isya",
];
const DEFAULT_CHECKLIST_ITEMS = [
  "Berpakaian rapi & menutup aurat", "Bertutur kata sopan",
  "Menghormati guru & orang tua", "Tidak berkata kasar/kotor",
  "Menjaga kebersihan lingkungan", "Membantu teman yang membutuhkan",
  "Tidak mencontek saat ujian", "Mengerjakan PR/tugas tepat waktu",
];
const GRADE_MAPPING: Record<string, string> = {
  IBNU_KHOLDUN: "KELAS_7", IBNU_SINA: "KELAS_7",
  IBNU_AL_HAYTAM: "KELAS_7", IBNU_RUSYD: "KELAS_7",
  AL_KINDI: "KELAS_8", AL_KHAWARIZMI: "KELAS_8",
};
const KELAS_DISPLAY: Record<string, string> = {
  IBNU_KHOLDUN: "Ibnu Kholdun", IBNU_SINA: "Ibnu Sina",
  IBNU_AL_HAYTAM: "Ibnu Al Haytam", IBNU_RUSYD: "Ibnu Rusyd",
  AL_KINDI: "Al Kindi", AL_KHAWARIZMI: "Al Khawarizmi",
};

export default function FormIbadahPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
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
  const [toast, setToast] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [existingReport, setExistingReport] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [questions, setQuestions] = useState({
    fardhu: DEFAULT_SHALAT_FARDHU,
    sunnah: DEFAULT_SHALAT_SUNNAH,
    checklist: DEFAULT_CHECKLIST_ITEMS,
  });

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) { const d = await res.json(); setProfileImage(d.user.image); }
      } catch {}
    };
    if (session?.user) fetchProfile();
  }, [session]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.class) return;
      const grade = GRADE_MAPPING[session.user.class] || "KELAS_7";
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const d = await res.json();
          setQuestions({
            fardhu: d[`${grade}_SHALAT_FARDHU`] || DEFAULT_SHALAT_FARDHU,
            sunnah: d[`${grade}_SHALAT_SUNNAH`] || DEFAULT_SHALAT_SUNNAH,
            checklist: d[`${grade}_CHECKLIST_ITEMS`] || DEFAULT_CHECKLIST_ITEMS,
          });
        }
      } catch {}
    };
    fetchSettings();
  }, [session]);

  useEffect(() => {
    const fn = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", fn);
    window.addEventListener("offline", fn);
    fn();
    return () => { window.removeEventListener("online", fn); window.removeEventListener("offline", fn); };
  }, []);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && date) loadExistingReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, session?.user?.id]);

  const loadExistingReport = async () => {
    try {
      const res = await fetch(`/api/reports?date=${date}`);
      if (res.ok) {
        const d = await res.json();
        if (d.report) {
          setExistingReport(true);
          const r = d.report;
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
          setExistingReport(false);
          setShalatFardhu([]); setShalatSunnah([]); setTilawah(""); setMurojaah("");
          setSedekah(null); setChecklist([]); setGoodDeeds(""); setImprovement("");
          setKnowledge(""); setNotes("");
        }
      }
    } catch {}
  };

  const toggle = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (date > todayStr) { showToast("error", "Tidak bisa mengisi laporan untuk tanggal mendatang"); return; }
    if (!shalatFardhu.length && !tilawah && !murojaah && sedekah === null && !checklist.length) {
      showToast("warning", "Mohon isi setidaknya satu aktivitas ibadah"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, shalat: { fardhu: shalatFardhu, sunnah: shalatSunnah }, tilawah, murojaah, sedekah: sedekah ?? false, checklist, goodDeeds, improvement, knowledge, notes }),
      });
      if (res.ok) {
        setExistingReport(true);
        showToast("success", existingReport ? "Laporan berhasil diperbarui! ✨" : "Laporan berhasil disimpan! Jazakallahu Khairan 🤲");
      } else {
        const d = await res.json();
        showToast("error", d.error || "Gagal menyimpan laporan");
      }
    } catch { showToast("error", "Terjadi kesalahan jaringan"); }
    finally { setLoading(false); }
  };

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="spinner"></div>
    </div>
  );
  if (!session) return null;

  const userName = session.user.name;
  const userClass = KELAS_DISPLAY[session.user.class] || session.user.class;

  // Progress calculation
  const totalItems = questions.fardhu.length + questions.sunnah.length + 1 + questions.checklist.length;
  const completedItems = shalatFardhu.length + shalatSunnah.length + (sedekah !== null ? 1 : 0) + checklist.length;
  const progressPct = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-32">
      {isOffline && (
        <div className="sticky top-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2">
          ⚠️ Anda sedang offline. Mode terbatas.
        </div>
      )}

      {/* Header */}
      <header className="gradient-header text-white px-4 pt-6 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
            <circle cx="350" cy="30" r="80" fill="white" />
            <circle cx="50" cy="160" r="60" fill="white" />
          </svg>
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all text-lg">
              ←
            </Link>
            <div className="text-center">
              <h1 className="text-lg font-bold">📖 Form Ibadah Harian</h1>
              <p className="text-emerald-100 text-xs">SMP Islam Modern Al Fakhir</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all" title="Keluar">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* User card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 shrink-0">
              {profileImage ? <img src={profileImage} alt={userName || ""} className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{userName}</p>
              <p className="text-emerald-100 text-xs">{userClass} · NIS {session.user.nis}</p>
            </div>
            {existingReport && <span className="text-xs bg-white/20 px-2 py-1 rounded-full shrink-0">✓ Tersimpan</span>}
          </div>

          {/* Progress bar */}
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Progress Hari Ini</span>
              <span className="text-sm font-bold">{progressPct}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: progressPct === 100 ? '#fbbf24' : 'white' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-emerald-100">
              <span>🕌 {shalatFardhu.length}/{questions.fardhu.length} Fardhu</span>
              <span>✨ {shalatSunnah.length} Sunnah</span>
              <span>✅ {checklist.length}/{questions.checklist.length} Akhlak</span>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Tanggal */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-base">📅</div>
              <span className="font-semibold text-gray-800 text-sm">Tanggal Laporan</span>
            </div>
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-gray-800 font-semibold transition-all"
            />
          </div>

          {/* Shalat Fardhu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-base">🕌</div>
                <span className="font-semibold text-gray-800 text-sm">Shalat Fardhu</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${shalatFardhu.length === questions.fardhu.length ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {shalatFardhu.length}/{questions.fardhu.length}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.fardhu.map((s) => {
                const checked = shalatFardhu.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggle(s, shalatFardhu, setShalatFardhu)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${checked ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-gray-50 hover:border-emerald-200'}`}>
                    <span className="text-xl">{SHALAT_ICONS[s] || "🕐"}</span>
                    <span className={`text-xs font-semibold ${checked ? 'text-emerald-700' : 'text-gray-500'}`}>{s}</span>
                    {checked && <span className="text-emerald-500 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shalat Sunnah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-base">✨</div>
                <span className="font-semibold text-gray-800 text-sm">Shalat Sunnah</span>
              </div>
              {shalatSunnah.length > 0 && (
                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-purple-100 text-purple-700">{shalatSunnah.length} selesai</span>
              )}
            </div>
            <div className="space-y-2">
              {questions.sunnah.map((s) => {
                const checked = shalatSunnah.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggle(s, shalatSunnah, setShalatSunnah)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${checked ? 'border-purple-300 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-purple-50/30'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                      {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-medium ${checked ? 'text-purple-800' : 'text-gray-600'}`}>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tilawah & Murojaah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-base">📖</div>
                <span className="font-semibold text-gray-800 text-sm">Tilawah Al-Qur&apos;an</span>
              </div>
              <input type="text" value={tilawah} onChange={e => setTilawah(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm text-gray-700 transition-all"
                placeholder="Contoh: QS. Al-Baqarah ayat 1-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-base">🔁</div>
                <span className="font-semibold text-gray-800 text-sm">Murojaah (Hafalan)</span>
              </div>
              <input type="text" value={murojaah} onChange={e => setMurojaah(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-700 transition-all"
                placeholder="Contoh: QS. An-Naba ayat 1-20" />
            </div>
          </div>

          {/* Sedekah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-base">💝</div>
              <span className="font-semibold text-gray-800 text-sm">Sedekah Hari Ini</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setSedekah(true)}
                className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${sedekah === true ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-500 hover:border-emerald-200'}`}>
                ✅ Ya, Alhamdulillah
              </button>
              <button type="button" onClick={() => setSedekah(false)}
                className={`py-4 rounded-xl border-2 font-semibold text-sm transition-all ${sedekah === false ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-100 text-gray-500 hover:border-rose-200'}`}>
                😔 Belum
              </button>
            </div>
          </div>

          {/* Checklist Akhlak */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-base">✅</div>
                <span className="font-semibold text-gray-800 text-sm">Checklist Akhlak</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${checklist.length === questions.checklist.length ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                {checklist.length}/{questions.checklist.length}
              </span>
            </div>
            <div className="space-y-2">
              {questions.checklist.map((item) => {
                const checked = checklist.includes(item);
                return (
                  <button key={item} type="button" onClick={() => toggle(item, checklist, setChecklist)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${checked ? 'border-teal-300 bg-teal-50' : 'border-gray-100 hover:border-teal-200 hover:bg-teal-50/30'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                      {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-medium ${checked ? 'text-teal-800' : 'text-gray-600'}`}>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refleksi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <p className="font-semibold text-gray-800 text-sm flex items-center gap-2"><span>💭</span> Refleksi Harian</p>
            {[
              { icon: "🌟", label: "Kebaikan Hari Ini", value: goodDeeds, setter: setGoodDeeds, placeholder: "Ceritakan kebaikan yang kamu lakukan hari ini..." },
              { icon: "🎯", label: "Perbaikan untuk Besok", value: improvement, setter: setImprovement, placeholder: "Apa yang ingin kamu perbaiki besok..." },
              { icon: "📚", label: "Ilmu Agama yang Didapat", value: knowledge, setter: setKnowledge, placeholder: "Ilmu agama apa yang kamu pelajari hari ini..." },
              { icon: "📝", label: "Catatan Tambahan", value: notes, setter: setNotes, placeholder: "Catatan lainnya (opsional)..." },
            ].map(({ icon, label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <span>{icon}</span> {label}
                </label>
                <textarea value={value} onChange={e => setter(e.target.value)} rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-700 resize-none transition-all"
                  placeholder={placeholder} />
              </div>
            ))}
          </div>

          <div className="h-4" />
        </form>
      </div>

      {/* Sticky Submit */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            style={{ background: loading ? '#6b7280' : 'linear-gradient(135deg, #059669, #0d9488)' }}>
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Menyimpan...</span></>
            ) : (
              <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>{existingReport ? "Perbarui Laporan" : "Simpan Laporan Ibadah"}</span></>
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]">
          <div className={`px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border ${
            toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
            toast.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
            "bg-red-50 border-red-200 text-red-800"}`}>
            <span className="text-xl">{toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "❌"}</span>
            <p className="font-semibold text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
