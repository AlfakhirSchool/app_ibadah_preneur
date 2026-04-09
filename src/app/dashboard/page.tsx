"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const KELAS_DISPLAY: Record<string, string> = {
  AL_KINDI: "Al Kindi",
  AL_KHAWARIZMI: "Al Khawarizmi",
  IBNU_KHOLDUN: "Ibnu Kholdun",
  IBNU_SINA: "Ibnu Sina",
  IBNU_AL_HAYTAM: "Ibnu Al Haytam",
  IBNU_RUSYD: "Ibnu Rusyd",
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<{ id: string, name: string, class: string, nis: string, image: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya boleh mengunggah file gambar.");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Ukuran gambar maksimal 1MB. Gunakan foto yang lebih kecil.");
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = reader.result as string;
      await uploadImage(base64Str);
    };
  };

  const uploadImage = async (base64Image: string) => {
    setUploading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, image: data.user.image } : null);
        alert("Foto profil berhasil diperbarui!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal mengunggah foto.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen islamic-pattern pb-8">
      {/* Header */}
      <header className="gradient-header text-white px-4 pt-6 pb-24 relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center p-1.5 backdrop-blur-md shadow-lg border border-white/30">
              <img src="/logo.png" alt="Logo Al Fakhir" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Ibadah Planner</h1>
              <p className="text-emerald-100 text-xs mt-0.5 font-medium tracking-wide">SMP Islam Modern Al Fakhir</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-emerald-100 hover:text-white text-sm flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2 transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10 space-y-6">
        
        {/* Profile Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center animate-fade-in relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary-100 to-transparent opacity-50 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-gold-100 to-transparent opacity-50 rounded-tr-full"></div>

          {/* Avatar Base */}
          <div className="relative z-10 mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center overflow-hidden relative transition-transform duration-300 group-hover:scale-105">
              {uploading ? (
                <div className="spinner w-8 h-8 border-primary-500"></div>
              ) : profile.image ? (
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-gray-400">👤</span>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xl">📷</span>
              </div>
            </div>
            {/* Small camera badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gold-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md cursor-pointer group-hover:bg-gold-600 transition-colors">
              <span className="text-sm">✎</span>
            </div>
            
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <h2 className="text-2xl font-bold text-primary-950 mb-1">{profile.name}</h2>
          <div className="flex items-center gap-2 text-sm text-primary-700 font-medium">
            <span className="badge badge-green">Kelas {KELAS_DISPLAY[profile.class] || profile.class}</span>
            <span className="badge bg-primary-100 text-primary-800 border border-primary-200">NIS: {profile.nis}</span>
          </div>
        </div>

        {/* Stats & Rank Card */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in-delay">
          <Link href="/leaderboard" className="glass-card p-4 flex flex-col items-center justify-center text-center hover:bg-primary-50 transition-colors group">
            <div className="w-10 h-10 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Peringkat</p>
            <p className="text-lg font-black text-primary-900">Lihat Rank</p>
          </Link>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mb-2">💎</div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Skor</p>
            <p className="text-lg font-black text-primary-900">Aktif</p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="glass-card p-5 animate-fade-in-delay">
          <h3 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
            <span className="text-lg">🎯</span> Menu Utama
          </h3>
          <Link href="/form-ibadah" className="block">
            <div className="bg-linear-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h4 className="text-xl font-bold mb-1 group-hover:text-gold-200 transition-colors">Isi Laporan Ibadah</h4>
                  <p className="text-primary-100 text-sm">Laporkan shalat, tilawah, dan akhlakmu hari ini.</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner backdrop-blur-sm">
                  📝
                </div>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
