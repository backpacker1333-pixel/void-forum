import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRank } from "@/lib/ranks";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { content, threadId } = await req.json();

  if (!content || !threadId) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return NextResponse.json({ error: "Thread introuvable" }, { status: 404 });
  }
  if (thread.isLocked) {
    return NextResponse.json({ error: "Thread verrouillé" }, { status: 403 });
  }

  const post = await prisma.post.create({
    data: { content, authorId: session.user.id, threadId },
    include: { author: true },
  });

  // Update post count, credits, rank
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { postCount: { increment: 1 }, credits: { increment: 2 } },
  });
  const newRank = getRank(updated.postCount);
  if (newRank !== updated.rank) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { rank: newRank },
    });
  }

  return NextResponse.json(post, { status: 201 });
}
