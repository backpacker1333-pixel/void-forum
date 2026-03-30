"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0f0f0f] border-b border-[#1e1e1e] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#6366f1] font-black text-xl tracking-tight">
            VOID
          </span>
          <span className="text-white font-black text-xl tracking-tight">
            FORUM
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/category/leaks" className="hover:text-white transition">Leaks</Link>
          <Link href="/category/tools" className="hover:text-white transition">Tools</Link>
          <Link href="/category/marketplace" className="hover:text-white transition">Market</Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href={`/profile/${session.user.name}`}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#6366f1] flex items-center justify-center text-xs font-bold text-white">
                  {session.user.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block">{session.user.name}</span>
              </Link>
              <span className="text-xs text-yellow-400 hidden md:block">
                {session.user.credits} cr
              </span>
              <Link
                href="/new-thread"
                className="bg-[#6366f1] hover:bg-[#5254cc] text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                + Post
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-500 hover:text-red-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#6366f1] hover:bg-[#5254cc] text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
