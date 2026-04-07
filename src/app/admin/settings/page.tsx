"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEFAULT_QUESTIONS: Record<string, string[]> = {
  SHALAT_FARDHU: ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"],
  SHALAT_SUNNAH: [
    "Tahajjud",
    "Dhuha",
    "Rawatib Qabliyah Subuh",
    "Rawatib Ba'diyah Dzuhur",
    "Rawatib Qabliyah Dzuhur",
    "Rawatib Ba'diyah Maghrib",
    "Rawatib Ba'diyah Isya",
  ],
  CHECKLIST_ITEMS: [
    "Berpakaian rapi & menutup aurat",
    "Bertutur kata sopan",
    "Menghormati guru & orang tua",
    "Tidak berkata kasar/kotor",
    "Menjaga kebersihan lingkungan",
    "Membantu teman yang membutuhkan",
    "Tidak mencontek saat ujian",
    "Mengerjakan PR/tugas tepat waktu",
  ],
};

const LABELS: Record<string, string> = {
  SHALAT_FARDHU: "Daftar Shalat Fardhu",
  SHALAT_SUNNAH: "Daftar Shalat Sunnah",
  CHECKLIST_ITEMS: "Daftar Pertanyaan / Checklist Akhlak",
};

const TINGKAT_OPTIONS = [
  { value: "KELAS_7", label: "Tingkat Kelas 7 (Al Kindi, Al Khawarizmi)" },
  { value: "KELAS_8", label: "Tingkat Kelas 8 (Ibnu Kholdun, Ibnu Sina)" },
  { value: "KELAS_9", label: "Tingkat Kelas 9 (Ibnu Al Haytam, Ibnu Rusyd)" },
];

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeGrade, setActiveGrade] = useState<string>("KELAS_7");
  const [activeCategory, setActiveCategory] = useState<string>("CHECKLIST_ITEMS");
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);

  const getFullKey = (cls: string, cat: string) => `${cls}_${cat}`;

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data || {});
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSettings();
    }
  }, [session, fetchSettings]);

  useEffect(() => {
    const fullKey = getFullKey(activeGrade, activeCategory);
    if (settings[fullKey]) {
      setItems(settings[fullKey]);
    } else {
      setItems(DEFAULT_QUESTIONS[activeCategory]);
    }
  }, [activeGrade, activeCategory, settings]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    if (idx + direction < 0 || idx + direction >= items.length) return;
    const newItems = [...items];
    const temp = newItems[idx];
    newItems[idx] = newItems[idx + direction];
    newItems[idx + direction] = temp;
    setItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    const fullKey = getFullKey(activeGrade, activeCategory);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: fullKey,
          value: items,
        }),
      });

      if (res.ok) {
        setSettings({ ...settings, [fullKey]: items });
        alert(`Soal untuk ${activeGrade.replace("_", " ")} berhasil disimpan!`);
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen islamic-pattern pb-8">
      {/* Header */}
      <header className="gradient-header text-white px-4 pt-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold">⚙️ Kelola Soal & Checklist</h1>
                <p className="text-emerald-100 text-xs mt-0.5">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-emerald-100 hover:text-white text-sm bg-white/10 rounded-xl px-3 py-2"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        <div className="glass-card overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-primary-50/50 border-r border-gray-100 p-4">
            
            <h3 className="font-bold text-primary-900 mb-2 px-2 text-sm">Pilih Tingkat</h3>
            <select
              value={activeGrade}
              onChange={(e) => setActiveGrade(e.target.value)}
              className="w-full p-2 mb-6 border border-gray-200 rounded-lg text-sm bg-white font-medium text-primary-800 focus:outline-hidden focus:border-primary-500"
            >
              {TINGKAT_OPTIONS.map((grade) => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>

            <h3 className="font-bold text-primary-900 mb-2 px-2 text-sm">Kategori Soal</h3>
            <div className="space-y-1">
              {Object.keys(LABELS).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    activeCategory === key
                      ? "bg-primary-500 text-white shadow-md"
                      : "text-primary-800 hover:bg-primary-100/50"
                  }`}
                >
                  {LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-950">
                  {LABELS[activeCategory]}
                </h2>
                <p className="text-sm text-primary-700 font-medium">Pengaturan: {TINGKAT_OPTIONS.find(c => c.value === activeGrade)?.label}</p>
              </div>
              <span className="badge badge-gold">{items.length} Item</span>
            </div>

            {/* List */}
            <div className="space-y-2 mb-6">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex flex-col gap-1 pr-2 border-r border-gray-100">
                    <button 
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="font-medium text-gray-700 flex-1">{item}</span>
                  <button
                    onClick={() => removeItem(idx)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-gray-500 text-center py-6">Belum ada soal ditambahkan.</p>
              )}
            </div>

            {/* Add New */}
            <form onSubmit={handleAddItem} className="flex gap-3 mb-8">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Ketik soal/checklist baru di sini..."
                className="form-input flex-1 py-3!"
              />
              <button
                type="submit"
                disabled={!newItem.trim()}
                className="bg-primary-100 hover:bg-primary-200 text-primary-800 font-semibold px-5 rounded-xl transition-colors disabled:opacity-50"
              >
                + Tambah
              </button>
            </form>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full py-3! text-lg font-semibold flex justify-center gap-2"
            >
              {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
