import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ambil semua laporan dalam 30 hari terakhir untuk perhitungan poin
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        class: true,
        image: true,
        reports: {
          where: {
            date: { gte: thirtyDaysAgo }
          }
        }
      }
    });

    // Hitung skor untuk setiap user
    const leaderboard = users.map(user => {
      let score = 0;
      
      user.reports.forEach(report => {
        const shalat = report.shalat as any;
        const checklist = report.checklist as any;

        // Fardhu: 5pts each
        if (shalat?.fardhu) score += shalat.fardhu.length * 5;
        // Sunnah: 2pts each
        if (shalat?.sunnah) score += shalat.sunnah.length * 2;
        // Tilawah: 10pts
        if (report.tilawah && report.tilawah.trim().length > 0) score += 10;
        // Murojaah: 10pts
        if (report.murojaah && report.murojaah.trim().length > 0) score += 10;
        // Sedekah: 5pts
        if (report.sedekah) score += 5;
        // Checklist: 1pt each
        if (checklist) score += checklist.length * 1;
      });

      return {
        id: user.id,
        name: user.name,
        class: user.class,
        image: user.image,
        totalScore: score,
        reportCount: user.reports.length
      };
    });

    // Urutkan berdasarkan skor tertinggi
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
