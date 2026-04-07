import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Check if admin already exists
    const adminExists = await prisma.user.findUnique({
      where: { nis: "admin" }
    });

    if (adminExists) {
      return NextResponse.json({ 
        message: "Database sudah terinisialisasi. Silakan login dengan akun admin yang ada." 
      }, { status: 400 });
    }

    // 2. Create Default Admin
    const hashedAdminPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Administrator",
        nis: "admin",
        password: hashedAdminPassword,
        class: "AL_KINDI",
        role: "ADMIN",
      }
    });

    // 3. Create Sample Students (Optional, but good for testing)
    const sampleStudents = [
      { name: "Ahmad Fauzi", nis: "2025001", class: "AL_KINDI" },
      { name: "Zainab Husna", nis: "2025008", class: "IBNU_RUSYD" },
    ];

    for (const s of sampleStudents) {
      // Default password: 4 last digits of NIS
      const last4 = s.nis.slice(-4).padStart(4, "0");
      const hashedPass = await bcrypt.hash(last4, 10);
      
      await prisma.user.upsert({
        where: { nis: s.nis },
        update: {},
        create: {
          name: s.name,
          nis: s.nis,
          password: hashedPass,
          class: s.class as any,
          role: "STUDENT",
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Inisialisasi Berhasil! Akun Admin (admin/admin123) telah dibuat. Silakan kembali ke halaman login." 
    });

  } catch (error: any) {
    console.error("Init error:", error);
    return NextResponse.json({ 
      error: "Gagal inisialisasi database", 
      details: error.message 
    }, { status: 500 });
  }
}
