import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch report for the logged-in user by date
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const date = new Date(dateStr + "T00:00:00.000Z");

  const report = await prisma.ibadahReport.findUnique({
    where: {
      userId_date: {
        userId: (session!.user as any).id,
        date,
      },
    },
  });

  return NextResponse.json({ report });
}

// POST: Create or update an ibadah report
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    date: dateStr,
    shalat,
    tilawah,
    murojaah,
    sedekah,
    checklist,
    goodDeeds,
    improvement,
    knowledge,
    notes,
  } = body;

  if (!dateStr) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const date = new Date(dateStr + "T00:00:00.000Z");
  
  const todayRaw = new Date();
  const todayYear = todayRaw.getFullYear();
  const todayMonth = String(todayRaw.getMonth() + 1).padStart(2, "0");
  const todayDay = String(todayRaw.getDate()).padStart(2, "0");
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

  if (dateStr > todayStr) {
    return NextResponse.json(
      { error: "Cannot report for future dates" },
      { status: 400 },
    );
  }

  const hasData =
    shalat?.fardhu?.length > 0 ||
    shalat?.sunnah?.length > 0 ||
    tilawah ||
    murojaah ||
    sedekah ||
    checklist?.length > 0;
  if (!hasData) {
    return NextResponse.json(
      { error: "At least one activity is required" },
      { status: 400 },
    );
  }

  const report = await prisma.ibadahReport.upsert({
    where: {
      userId_date: {
        userId: (session!.user as any).id,
        date,
      },
    },
    update: {
      shalat: shalat || { fardhu: [], sunnah: [] },
      tilawah: tilawah || "",
      murojaah: murojaah || "",
      sedekah: sedekah ?? false,
      checklist: checklist || [],
      goodDeeds: goodDeeds || "",
      improvement: improvement || "",
      knowledge: knowledge || "",
      notes: notes || "",
    },
    create: {
      userId: (session!.user as any).id,
      date,
      shalat: shalat || { fardhu: [], sunnah: [] },
      tilawah: tilawah || "",
      murojaah: murojaah || "",
      sedekah: sedekah ?? false,
      checklist: checklist || [],
      goodDeeds: goodDeeds || "",
      improvement: improvement || "",
      knowledge: knowledge || "",
      notes: notes || "",
    },
  });

  return NextResponse.json({ report }, { status: 200 });
}
