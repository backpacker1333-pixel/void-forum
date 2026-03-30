import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Mot de passe trop court (min 6 caractères)" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email ou pseudo déjà utilisé" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
