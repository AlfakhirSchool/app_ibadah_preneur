import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nis: true,
        class: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { students } = body; // expect an array of students

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const createdUsers = [];
    const errors = [];

    for (const student of students) {
      if (!student.name || !student.nis || !student.class) {
        errors.push(`Data tidak lengkap untuk NIS ${student.nis}`);
        continue;
      }

      try {
        const nisString = student.nis.toString().trim();
        // Get last 4 digits of NIS, pad with zeroes if shorter than 4
        let last4 = nisString.slice(-4);
        if (last4.length < 4) last4 = last4.padStart(4, "0");
        const defaultPassword = await bcrypt.hash(last4, 10);

        const user = await prisma.user.upsert({
          where: { nis: nisString },
          update: {
            name: student.name,
            class: student.class,
          },
          create: {
            name: student.name,
            nis: nisString,
            password: defaultPassword,
            class: student.class,
            role: "STUDENT",
          },
        });
        createdUsers.push(user);
      } catch (err: any) {
        errors.push(`Gagal menyimpan NIS ${student.nis}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      created: createdUsers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, class: newClass, nis } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        class: newClass,
        nis,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
