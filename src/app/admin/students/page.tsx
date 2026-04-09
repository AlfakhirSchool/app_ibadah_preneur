"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const KELAS_OPTIONS = [
  { value: "IBNU_KHOLDUN", label: "Ibnu Kholdun" },
  { value: "IBNU_SINA", label: "Ibnu Sina" },
  { value: "IBNU_AL_HAYTAM", label: "Ibnu Al Haytam" },
  { value: "IBNU_RUSYD", label: "Ibnu Rusyd" },
  { value: "AL_KINDI", label: "Al Kindi" },
  { value: "AL_KHAWARIZMI", label: "Al Khawarizmi" },
];

const KELAS_DISPLAY: Record<string, string> = {
  IBNU_KHOLDUN: "Ibnu Kholdun",
  IBNU_SINA: "Ibnu Sina",
  IBNU_AL_HAYTAM: "Ibnu Al Haytam",
  IBNU_RUSYD: "Ibnu Rusyd",
  AL_KINDI: "Al Kindi",
  AL_KHAWARIZMI: "Al Khawarizmi",
};

interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
}

export default function ManageStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newNis, setNewNis] = useState("");
  const [newClass, setNewClass] = useState("IBNU_KHOLDUN");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
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
      fetchStudents();
    }
  }, [session, fetchStudents]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: [
            { name: newName, nis: newNis.toString().trim(), class: newClass },
          ],
        }),
      });

      if (res.ok) {
        setNewName("");
        setNewNis("");
        setNewClass("IBNU_KHOLDUN");
        setIsAdding(false);
        fetchStudents();
        alert("Siswa berhasil ditambahkan! Password default adalah 4 angka terakhir dari NIS.");
      } else {
        alert("Gagal menambahkan siswa.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent),
      });

      if (res.ok) {
        setEditingStudent(null);
        fetchStudents();
        alert("Data siswa berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui data siswa.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa bernama ${name}? Data laporannya juga akan terhapus.`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Siswa berhasil dihapus!");
        fetchStudents();
      } else {
        alert("Gagal menghapus siswa.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
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
                className="w-10 h-10 rounded-full bg-linear-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 flex items-center justify-center transition-all shadow-md group border border-white/20"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform text-white font-bold">←</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold">🎓 Kelola Siswa</h1>
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
      <div className="max-w-6xl mx-auto px-4 -mt-4 relative z-10">
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-primary-900 text-lg">
              Daftar Siswa Terdaftar
              <span className="badge badge-blue ml-3">{students.length} Orang</span>
            </h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="btn-primary py-2! px-4! text-sm!"
            >
              {isAdding ? "Batal Tambah" : "+ Tambah Siswa Baru"}
            </button>
          </div>

          {isAdding && (
            <div className="p-6 bg-primary-50/50 border-b border-primary-100 animate-fade-in">
              <form
                onSubmit={handleAddSubmit}
                className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-primary-800 mb-1.5">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    required
                    value={newNis}
                    onChange={(e) => setNewNis(e.target.value)}
                    className="form-input py-2! bg-white!"
                    placeholder="Contoh: 2025001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-800 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="form-input py-2! bg-white!"
                    placeholder="Nama lengkap siswa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-800 mb-1.5">
                    Kelas
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="form-input py-2! bg-white!"
                  >
                    {KELAS_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button type="submit" className="btn-primary w-full py-2!">
                    Simpan Siswa
                  </button>
                </div>
              </form>
              <div className="mt-3 text-xs text-primary-600 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center">ℹ</span>
                Password default siswa otomatis menggunakan: <strong>4 angka terakhir dari NIS</strong>. (Contoh: NIS 2025001 = 5001)
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-16 text-center">No</th>
                  <th>NIS</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas</th>
                  <th className="w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-primary-50/30 transition-colors">
                    <td className="text-center font-medium text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="font-semibold text-primary-900">
                      {student.nis}
                    </td>
                    <td className="text-gray-700">{student.name}</td>
                    <td>
                      <span className="badge badge-green">
                        {KELAS_DISPLAY[student.class] || student.class}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                          title="Pindah Kelas / Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Belum ada data siswa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Edit / Pindah Kelas */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-primary-900">Edit Data Siswa</h3>
               <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Siswa</label>
                  <input 
                    type="text" 
                    value={editingStudent.name} 
                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                    className="form-input"
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">NIS (Nomor Induk)</label>
                  <input 
                    type="text" 
                    value={editingStudent.nis} 
                    onChange={(e) => setEditingStudent({...editingStudent, nis: e.target.value})}
                    className="form-input"
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Pindah ke Kelas</label>
                  <select 
                    value={editingStudent.class} 
                    onChange={(e) => setEditingStudent({...editingStudent, class: e.target.value})}
                    className="form-input"
                  >
                    {KELAS_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
               </div>
               
               <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
                  <button type="submit" className="flex-1 btn-primary py-2!">Simpan</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
