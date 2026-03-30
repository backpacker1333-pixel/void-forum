import { NextRequest, NextResponse } from "next/server";
import { requireMod } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const guard = await requireMod();
  if (guard.error) return guard.error;

  const { threadId, action } = await req.json();

  if (!threadId || !action) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (action === "pin") {
    await prisma.thread.update({ where: { id: threadId }, data: { isPinned: true } });
  } else if (action === "unpin") {
    await prisma.thread.update({ where: { id: threadId }, data: { isPinned: false } });
  } else if (action === "lock") {
    await prisma.thread.update({ where: { id: threadId }, data: { isLocked: true } });
  } else if (action === "unlock") {
    await prisma.thread.update({ where: { id: threadId }, data: { isLocked: false } });
  } else if (action === "delete") {
    await prisma.thread.delete({ where: { id: threadId } });
  } else {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
