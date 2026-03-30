import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { threads: true } },
      threads: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { author: true },
      },
    },
  });

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.thread.count(),
    prisma.post.count(),
  ]);

  const latestThreads = await prisma.thread.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: true, category: true, _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f0f1a] to-[#131328] border border-[#6366f1]/20 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#6366f130_0%,_transparent_60%)]" />
        <div className="relative">
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome to{" "}
            <span className="text-[#6366f1]">VoidForum</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-lg">
            The underground community. Share, learn, connect. Earn credits by contributing.
          </p>
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{stats[0].toLocaleString()}</p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{stats[1].toLocaleString()}</p>
              <p className="text-xs text-gray-500">Threads</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{stats[2].toLocaleString()}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Categories
          </h2>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-4 bg-[#131313] border border-[#1e1e1e] hover:border-[#6366f1]/40 hover:bg-[#161616] rounded-lg p-4 transition group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: cat.color + "22", border: `1px solid ${cat.color}44` }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="font-semibold text-white text-sm group-hover:text-[#6366f1] transition"
                  >
                    {cat.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: cat.color + "22", color: cat.color }}
                  >
                    {cat._count.threads}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{cat.description}</p>
                {cat.threads[0] && (
                  <p className="text-[10px] text-gray-600 mt-1 truncate">
                    Last: <span className="text-gray-400">{cat.threads[0].title}</span>{" "}
                    by <span className="text-[#6366f1]">{cat.threads[0].author.username}</span>
                  </p>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-[#6366f1] transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Latest Threads
          </h2>
          <div className="space-y-2">
            {latestThreads.map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="block bg-[#131313] border border-[#1e1e1e] hover:border-[#6366f1]/30 rounded-lg p-3 transition group"
              >
                <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-[#6366f1] transition">
                  {thread.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-[#6366f1]">
                    {thread.author.username}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {thread.category.name}
                  </span>
                  <span className="text-[10px] text-gray-600 ml-auto">
                    {thread._count.posts} replies
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Rank legend */}
          <div className="bg-[#131313] border border-[#1e1e1e] rounded-lg p-4 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Ranks
            </h3>
            {[
              { name: "Newbie", color: "#9ca3af", posts: "0" },
              { name: "Member", color: "#60a5fa", posts: "10" },
              { name: "Regular", color: "#34d399", posts: "50" },
              { name: "Veteran", color: "#f59e0b", posts: "200" },
              { name: "Elite", color: "#f97316", posts: "500" },
              { name: "Legend", color: "#ef4444", posts: "1000" },
              { name: "God", color: "#a855f7", posts: "5000" },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold" style={{ color: r.color }}>
                  {r.name}
                </span>
                <span className="text-[10px] text-gray-600">{r.posts}+ posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
