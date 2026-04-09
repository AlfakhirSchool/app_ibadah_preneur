"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const KELAS_OPTIONS = [
  { value: "ALL", label: "Semua Kelas" },
  { value: "AL_KINDI", label: "Al Kindi" },
  { value: "AL_KHAWARIZMI", label: "Al Khawarizmi" },
  { value: "IBNU_KHOLDUN", label: "Ibnu Kholdun" },
  { value: "IBNU_SINA", label: "Ibnu Sina" },
  { value: "IBNU_AL_HAYTAM", label: "Ibnu Al Haytam" },
  { value: "IBNU_RUSYD", label: "Ibnu Rusyd" },
  { value: "AL_KINDI", label: "Al Kindi" },
  { value: "AL_KHAWARIZMI", label: "Al Khawarizmi" },
];

const KELAS_DISPLAY: Record<string, string> = {
  AL_KINDI: "Al Kindi",
  AL_KHAWARIZMI: "Al Khawarizmi",
  IBNU_KHOLDUN: "Ibnu Kholdun",
  IBNU_SINA: "Ibnu Sina",
  IBNU_AL_HAYTAM: "Ibnu Al Haytam",
  IBNU_RUSYD: "Ibnu Rusyd",
};

interface Report {
  id: string;
  date: string;
  shalat: { fardhu: string[]; sunnah: string[] };
  tilawah: string;
  murojaah: string;
  sedekah: boolean;
  checklist: string[];
  goodDeeds: string;
  improvement: string;
  knowledge: string;
  notes: string;
  user: {
    name: string;
    nis: string;
    class: string;
  };
}

interface Stats {
  totalStudents: number;
  todayReports: number;
  totalReports: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    todayReports: 0,
    totalReports: 0,
  });
  const [filterKelas, setFilterKelas] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterKelas !== "ALL") params.set("kelas", filterKelas);
      if (filterDate) params.set("date", filterDate);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setStats(data.stats);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [filterKelas, filterDate]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [session, fetchData]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen islamic-pattern pb-8">
      {/* Header */}
      <header className="gradient-header text-white px-4 pt-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                📊 Dashboard Admin
              </h1>
              <p className="text-emerald-100 text-xs mt-0.5">
                SMP Islam Modern Al Fakhir
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/admin/settings"
                className="text-white hover:text-gold-400 font-semibold text-sm flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-all duration-300"
              >
                ⚙️ Kelola Soal
              </Link>
              <Link
                href="/admin/students"
                className="text-white hover:text-gold-400 font-semibold text-sm flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-all duration-300"
              >
                🎓 Kelola Siswa
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-primary-100 hover:text-white text-sm flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-2 transition-colors"
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
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                  👨‍🎓
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-900">
                    {stats.totalStudents}
                  </p>
                  <p className="text-sm text-gray-500">Total Siswa</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                  📝
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-900">
                    {stats.todayReports}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    Lapor Hari Ini
                    <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot inline-block"></span>
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
                  📋
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-900">
                    {stats.totalReports}
                  </p>
                  <p className="text-sm text-gray-500">Total Laporan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
        {/* Filters */}
        <div className="glass-card p-5 mb-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <span className="text-lg">🔍</span> Filter Laporan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Kelas
              </label>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="form-input"
              >
                {KELAS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          {(filterKelas !== "ALL" || filterDate) && (
            <button
              onClick={() => {
                setFilterKelas("ALL");
                setFilterDate("");
              }}
              className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              ✕ Hapus Filter
            </button>
          )}
        </div>

        {/* Reports Table */}
        <div className="glass-card overflow-hidden animate-fade-in-delay">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-primary-900 flex items-center gap-2">
              <span className="text-lg">📋</span> Rekapitulasi Laporan
              <span className="badge badge-green ml-2">
                {reports.length} data
              </span>
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-500 font-medium">
                Belum ada laporan ditemukan
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Coba ubah filter untuk menemukan data
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>NIS</th>
                    <th>Kelas</th>
                    <th>Tanggal</th>
                    <th>Fardhu</th>
                    <th>Sunnah</th>
                    <th>Sedekah</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={report.id}>
                      <td className="text-center font-medium text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="font-medium text-primary-900">
                        {report.user.name}
                      </td>
                      <td className="text-gray-600">{report.user.nis}</td>
                      <td>
                        <span className="badge badge-green">
                          {KELAS_DISPLAY[report.user.class] || report.user.class}
                        </span>
                      </td>
                      <td className="text-gray-600 whitespace-nowrap">
                        {formatDate(report.date)}
                      </td>
                      <td className="text-center">
                        <span
                          className={`font-bold ${
                            report.shalat?.fardhu?.length === 5
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {report.shalat?.fardhu?.length || 0}/5
                        </span>
                      </td>
                      <td className="text-center font-medium text-gray-600">
                        {report.shalat?.sunnah?.length || 0}
                      </td>
                      <td className="text-center">
                        {report.sedekah ? (
                          <span className="text-emerald-600 font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors"
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-900">
                Detail Laporan
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Student Info */}
              <div className="bg-primary-50 rounded-xl p-4">
                <p className="font-semibold text-primary-900">
                  {selectedReport.user.name}
                </p>
                <p className="text-sm text-primary-700">
                  NIS: {selectedReport.user.nis} •{" "}
                  {KELAS_DISPLAY[selectedReport.user.class]}
                </p>
                <p className="text-sm text-primary-600 mt-1">
                  {formatDate(selectedReport.date)}
                </p>
              </div>

              {/* Shalat */}
              <div>
                <p className="font-semibold text-sm text-primary-800 mb-2">
                  🕌 Shalat Fardhu
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"].map(
                    (s) => (
                      <span
                        key={s}
                        className={`badge ${
                          selectedReport.shalat?.fardhu?.includes(s)
                            ? "badge-green"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {s}
                      </span>
                    )
                  )}
                </div>
              </div>

              {selectedReport.shalat?.sunnah?.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-primary-800 mb-2">
                    ✨ Shalat Sunnah
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.shalat.sunnah.map((s: string) => (
                      <span key={s} className="badge badge-blue">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tilawah & Murojaah */}
              {selectedReport.tilawah && (
                <div>
                  <p className="font-semibold text-sm text-primary-800">
                    📖 Tilawah
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedReport.tilawah}
                  </p>
                </div>
              )}

              {selectedReport.murojaah && (
                <div>
                  <p className="font-semibold text-sm text-primary-800">
                    🔁 Murojaah
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedReport.murojaah}
                  </p>
                </div>
              )}

              {/* Sedekah */}
              <div>
                <p className="font-semibold text-sm text-primary-800">
                  💝 Sedekah
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedReport.sedekah ? "Ya ✓" : "Belum"}
                </p>
              </div>

              {/* Checklist */}
              {selectedReport.checklist?.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-primary-800 mb-1">
                    ✅ Checklist Akhlak
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedReport.checklist.map((item: string) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Text fields */}
              {selectedReport.goodDeeds && (
                <div>
                  <p className="font-semibold text-sm text-primary-800">
                    🌟 Kebaikan
                  </p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedReport.goodDeeds}
                  </p>
                </div>
              )}

              {selectedReport.improvement && (
                <div>
                  <p className="font-semibold text-sm text-primary-800">
                    🎯 Perbaikan
                  </p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedReport.improvement}
                  </p>
                </div>
              )}

              {selectedReport.knowledge && (
                <div>
                  <p className="font-semibold text-sm text-primary-800">
                    📚 Ilmu Agama
                  </p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedReport.knowledge}
                  </p>
                </div>
              )}

              {selectedReport.notes && (
                <div>
                  <p className="font-semibold text-sm text-primary-800">
                    📝 Catatan
                  </p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {selectedReport.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
