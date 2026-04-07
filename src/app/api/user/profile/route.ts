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
      },
    });
    
    return NextResponse.json({ user });
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
