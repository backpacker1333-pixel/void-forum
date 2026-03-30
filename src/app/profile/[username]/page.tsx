import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getRankColor } from "@/lib/ranks";

export const revalidate = 60;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      threads: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { category: true, _count: { select: { posts: true } } },
      },
      _count: { select: { threads: true, posts: true } },
    },
  });

  if (!user) notFound();

  const rankColor = getRankColor(user.rank);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div
          className="h-24 w-full"
          style={{ background: `linear-gradient(135deg, ${rankColor}22, #0f0f1a)` }}
        />
        <div className="px-6 pb-6 -mt-10">
          <div
            className="w-16 h-16 rounded-full border-4 border-[#131313] bg-[#1a1a2e] flex items-center justify-center text-2xl font-bold text-white mb-3"
            style={{ borderColor: rankColor + "66" }}
          >
            {user.username[0]?.toUpperCase()}
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{user.username}</h1>
              <p className="text-sm font-bold" style={{ color: rankColor }}>
                {user.rank}
              </p>
              {user.bio && (
                <p className="text-sm text-gray-400 mt-2 max-w-lg">{user.bio}</p>
              )}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-white">{user._count.threads}</p>
                <p className="text-xs text-gray-600">Threads</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{user._count.posts}</p>
                <p className="text-xs text-gray-600">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{user.credits}</p>
                <p className="text-xs text-gray-600">Credits</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 mt-3">
            Member since{" "}
            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Threads */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Recent Threads
        </h2>
        <div className="space-y-2">
          {user.threads.length === 0 ? (
            <p className="text-sm text-gray-600 py-6 text-center">No threads yet.</p>
          ) : (
            user.threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="flex items-center gap-3 bg-[#131313] border border-[#1e1e1e] hover:border-[#6366f1]/30 rounded-lg px-4 py-3 transition group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#6366f1] transition truncate">
                    {thread.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: thread.category.color + "22",
                        color: thread.category.color,
                      }}
                    >
                      {thread.category.name}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                    </span>
                    <span>{thread._count.posts} replies</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
