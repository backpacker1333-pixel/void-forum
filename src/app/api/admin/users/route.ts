import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      rank: true,
      banned: true,
      postCount: true,
      credits: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { userId, action, role } = await req.json();

  if (!userId || !action) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (action === "ban") {
    await prisma.user.update({ where: { id: userId }, data: { banned: true } });
  } else if (action === "unban") {
    await prisma.user.update({ where: { id: userId }, data: { banned: false } });
  } else if (action === "setRole" && role) {
    await prisma.user.update({ where: { id: userId }, data: { role } });
  } else {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
