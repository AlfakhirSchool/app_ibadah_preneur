import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Base64 regex for basic validation
const IS_BASE64 = /^data:image\/(jpeg|png|webp|gif);base64,/;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        class: true,
        nis: true,
        image: true,
        reports: {
          orderBy: { date: 'desc' },
          take: 30
        }
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Calculate Streak
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let checkDate = new Date(today);
    const reportDates = user.reports.map(r => new Date(r.date).toISOString().split('T')[0]);

    // Check if reported today or yesterday to continue streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hasToday = reportDates.includes(today.toISOString().split('T')[0]);
    const hasYesterday = reportDates.includes(yesterday.toISOString().split('T')[0]);

    if (hasToday || hasYesterday) {
      let current = hasToday ? today : yesterday;
      while (reportDates.includes(current.toISOString().split('T')[0])) {
        streak++;
        current.setDate(current.getDate() - 1);
      }
    }

    // Calculate Score & Consistency
    let totalPoints = 0;
    let perfectDays = 0; // Days with 5 fardhu
    
    user.reports.forEach(report => {
        const shalat = report.shalat as any;
        const checklist = report.checklist as any;

        if (shalat?.fardhu) {
            totalPoints += shalat.fardhu.length * 5;
            if (shalat.fardhu.length === 5) perfectDays++;
        }
        if (shalat?.sunnah) totalPoints += shalat.sunnah.length * 2;
        if (report.tilawah) totalPoints += 10;
        if (report.murojaah) totalPoints += 10;
        if (report.sedekah) totalPoints += 5;
        if (checklist) totalPoints += checklist.length * 1;
    });

    const stats = {
        streak,
        consistency: user.reports.length > 0 ? Math.round((perfectDays / user.reports.length) * 100) : 0,
        points: totalPoints,
        totalReports: user.reports.length
    };
    
    return NextResponse.json({ 
        user: {
            id: user.id,
            name: user.name,
            class: user.class,
            nis: user.nis,
            image: user.image
        },
        stats 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { image } = body;

    if (!image || !IS_BASE64.test(image)) {
      return NextResponse.json({ error: "Invalid image format. Must be Base64 JPEG/PNG" }, { status: 400 });
    }

    // Limit payload size to avoid blowing up DB (e.g. 1MB is roughly ~1.4MB base64 string length)
    if (image.length > 1400000) {
      return NextResponse.json({ error: "Image size too large. Maximum 1MB." }, { status: 413 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
      select: { id: true, image: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
