"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const KELAS_DISPLAY: Record<string, string> = {
  AL_KINDI: "Al Kindi",
  AL_KHAWARIZMI: "Al Khawarizmi",
  IBNU_KHOLDUN: "Ibnu Kholdun",
  IBNU_SINA: "Ibnu Sina",
  IBNU_AL_HAYTAM: "Ibnu Al Haytam",
  IBNU_RUSYD: "Ibnu Rusyd",
};

interface LeaderboardEntry {
  id: string;
  name: string;
  class: string;
  image: string | null;
  totalScore: number;
  reportCount: number;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.leaderboard);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchLeaderboard();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentUserRank = data.findIndex(e => e.id === session?.user?.id) + 1;

  return (
    <div className="min-h-screen islamic-pattern pb-8">
      {/* Header */}
      <header className="gradient-header text-white px-4 pt-6 pb-20 relative overflow-hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
             <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                ←
             </Link>
             <div>
               <h1 className="text-xl font-bold">Peringkat Keaktifan</h1>
               <p className="text-emerald-100 text-xs">30 Hari Terakhir ✨</p>
             </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
             <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-200">Sko Anda</p>
             <p className="text-xl font-black">{data.find(e => e.id === session?.user?.id)?.totalScore || 0}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-10 space-y-6">
        
        {/* Podium Top 3 */}
        {data.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-8 animate-fade-in pt-4">
             {/* Rank 2 */}
             <div className="flex flex-col items-center flex-1 max-w-[100px]">
                <div className="relative mb-2">
                   <div className="w-16 h-16 rounded-full border-4 border-silver-400 overflow-hidden shadow-lg bg-white">
                      {data[1].image ? <img src={data[1].image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl flex items-center justify-center h-full">🥈</span>}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-silver-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">2</div>
                </div>
                <p className="text-[10px] font-bold text-primary-900 truncate w-full text-center">{data[1].name.split(' ')[0]}</p>
                <div className="bg-silver-200 h-16 w-full rounded-t-lg mt-2 flex items-center justify-center text-silver-700 font-bold text-xs">{data[1].totalScore}</div>
             </div>

             {/* Rank 1 */}
             <div className="flex flex-col items-center flex-1 max-w-[120px] -mt-10">
                <div className="relative mb-3">
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>
                   <div className="w-20 h-20 rounded-full border-4 border-gold-400 overflow-hidden shadow-2xl bg-white scale-110">
                      {data[0].image ? <img src={data[0].image} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl flex items-center justify-center h-full">🥇</span>}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-500 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">1</div>
                </div>
                <p className="text-xs font-black text-primary-950 truncate w-full text-center mb-1">{data[0].name.split(' ')[0]}</p>
                <div className="bg-gold-300 h-28 w-full rounded-t-xl flex flex-col items-center justify-center text-gold-900 shadow-lg border-x border-t border-gold-400/50">
                    <p className="text-lg font-black">{data[0].totalScore}</p>
                    <p className="text-[8px] font-bold uppercase opacity-80">Poin</p>
                </div>
             </div>

             {/* Rank 3 */}
             <div className="flex flex-col items-center flex-1 max-w-[100px]">
                <div className="relative mb-2">
                   <div className="w-16 h-16 rounded-full border-4 border-bronze-400 overflow-hidden shadow-lg bg-white">
                      {data[2].image ? <img src={data[2].image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl flex items-center justify-center h-full">🥉</span>}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-bronze-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">3</div>
                </div>
                <p className="text-[10px] font-bold text-primary-900 truncate w-full text-center">{data[2].name.split(' ')[0]}</p>
                <div className="bg-bronze-200 h-12 w-full rounded-t-lg mt-2 flex items-center justify-center text-bronze-700 font-bold text-xs">{data[2].totalScore}</div>
             </div>
          </div>
        )}

        {/* Full List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h2 className="text-sm font-bold text-primary-900">Peringkat Sekolah</h2>
             <span className="text-[10px] font-bold text-gray-400">Peringkat Anda: #{currentUserRank || '-'}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.slice(3).map((entry, index) => (
              <div key={entry.id} className={`flex items-center gap-4 p-4 transition-colors ${entry.id === session?.user?.id ? 'bg-primary-50/50' : 'hover:bg-gray-50'}`}>
                <div className="w-6 text-center text-xs font-bold text-gray-400">{index + 4}</div>
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                  {entry.image ? <img src={entry.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👤</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${entry.id === session?.user?.id ? 'text-primary-700' : 'text-gray-800'}`}>{entry.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Kelas {KELAS_DISPLAY[entry.class] || entry.class} • {entry.reportCount} Laporan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary-900">{entry.totalScore}</p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase">Poin</p>
                </div>
              </div>
            ))}
            
            {data.length <= 3 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                   Belum ada data peringkat lainnya.
                </div>
            )}
          </div>
        </div>

        <div className="text-center p-4">
           <p className="text-xs text-primary-600/60 font-medium italic">"Berlombalah dalam kebaikan (Fastabiqul Khairat)"</p>
        </div>

      </div>
    </div>
  );
}
