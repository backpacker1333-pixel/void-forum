import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRank } from "@/lib/ranks";

function slugify(str: string) {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) +
    "-" +
    Date.now()
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { title, content, categoryId } = await req.json();

  if (!title || !content || !categoryId) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const thread = await prisma.thread.create({
    data: {
      title,
      content,
      slug: slugify(title),
      authorId: session.user.id,
      categoryId,
    },
    include: { author: true, category: true },
  });

  // Update post count and rank
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { postCount: { increment: 1 }, credits: { increment: 5 } },
  });
  const newRank = getRank(updated.postCount);
  if (newRank !== updated.rank) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { rank: newRank },
    });
  }

  return NextResponse.json(thread, { status: 201 });
}
