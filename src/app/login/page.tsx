"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        nis,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("NIS atau Password salah. Silakan coba lagi.");
      } else {
        // Fetch session to get role
        const res = await fetch("/api/auth/session");
        const session = await res.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          {/* Logo with Glow Effect */}
          <div className="mx-auto w-40 h-40 flex items-center justify-center mb-4 relative group">
            <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            <img 
              src="/logo.png" 
              alt="Logo SMP Islam Modern Al Fakhir" 
              className="w-full h-full object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <h1 className="text-3xl font-extrabold text-primary-950 mb-1 tracking-tight">
            Ibadah Planner
          </h1>
          <p className="text-primary-700 font-bold text-sm tracking-widest uppercase mb-3">
            SMP Islam Modern Al Fakhir
          </p>
          <div className="w-16 h-1 bg-gold-400 rounded-full mb-3 opacity-80"></div>
          <p className="text-primary-800/70 text-sm font-medium">
            Sistem Pencatatan Ibadah Mutaba'ah Yaumiyyah
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 sm:p-10 border-t-4 border-t-primary-500 shadow-[0_20px_50px_-12px_rgba(17,129,124,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <h2 className="text-xl font-bold text-primary-950 mb-8 text-center tracking-tight">
            Masuk ke Akun
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Nomor Induk Siswa (NIS)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  id="nis"
                  type="text"
                  inputMode="numeric"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="form-input pl-12! bg-white/60 focus:bg-white transition-all duration-300"
                  placeholder="Contoh: 2025001"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-12! pr-12! bg-white/60 focus:bg-white transition-all duration-300"
                  style={{ paddingRight: "48px" }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="spinner w-5! h-5! border-2! border-white/30! border-t-white!"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-sm font-medium text-primary-800/60 mb-2">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className="text-xs text-primary-800/40 font-medium">
            © 2026 SMP Islam Modern Al Fakhir
          </p>
        </div>
      </div>
    </div>
  );
}
