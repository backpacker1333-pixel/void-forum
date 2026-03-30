import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 30;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      threads: {
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        include: {
          author: true,
          _count: { select: { posts: true, likes: true } },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { author: true },
          },
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 bg-[#131313] border border-[#1e1e1e] rounded-xl p-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: category.color + "22", border: `1px solid ${category.color}44` }}
        >
          {category.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{category.name}</h1>
          <p className="text-sm text-gray-500">{category.description}</p>
        </div>
        <Link
          href={`/new-thread?category=${category.id}`}
          className="ml-auto bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + New Thread
        </Link>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/" className="hover:text-gray-400">Home</Link>
        <span>/</span>
        <span className="text-gray-400">{category.name}</span>
      </div>

      {/* Thread list */}
      <div className="space-y-1">
        {category.threads.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">💬</p>
            <p>No threads yet. Be the first to post!</p>
          </div>
        ) : (
          category.threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/thread/${thread.id}`}
              className="flex items-center gap-4 bg-[#131313] border border-[#1e1e1e] hover:border-[#6366f1]/30 hover:bg-[#161616] rounded-lg px-4 py-3 transition group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {thread.isPinned && (
                    <span className="text-[10px] bg-[#6366f1]/20 text-[#6366f1] px-1.5 py-0.5 rounded font-bold">
                      PINNED
                    </span>
                  )}
                  {thread.isLocked && (
                    <span className="text-[10px] bg-red-900/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                      LOCKED
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#6366f1] transition truncate">
                    {thread.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-600">
                  <span>
                    by <span className="text-[#6366f1]">{thread.author.username}</span>
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                  </span>
                  {thread.posts[0] && (
                    <span>
                      Last reply by{" "}
                      <span className="text-gray-400">{thread.posts[0].author.username}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 shrink-0">
                <div className="text-center hidden sm:block">
                  <p className="font-semibold text-gray-400">{thread._count.posts}</p>
                  <p className="text-[10px]">replies</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-semibold text-gray-400">{thread.views}</p>
                  <p className="text-[10px]">views</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-semibold text-gray-400">{thread._count.likes}</p>
                  <p className="text-[10px]">likes</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
