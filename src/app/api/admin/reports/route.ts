import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const kelas = searchParams.get("kelas");
  const dateStr = searchParams.get("date");

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (kelas && kelas !== "ALL") {
    where.user = { class: kelas };
  }

  if (dateStr) {
    const date = new Date(dateStr + "T00:00:00.000Z");
    where.date = date;
  }

  const reports = await prisma.ibadahReport.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          nis: true,
          class: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  // Statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUTC = new Date(today.toISOString().split("T")[0] + "T00:00:00.000Z");

  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT" },
  });

  const todayReports = await prisma.ibadahReport.count({
    where: { date: todayUTC },
  });

  const totalReports = await prisma.ibadahReport.count();

  return NextResponse.json({
    reports,
    stats: {
      totalStudents,
      todayReports,
      totalReports,
    },
  });
}
