import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import UserBadge from "@/components/UserBadge";
import ReplyForm from "@/components/ReplyForm";
import ModActions from "@/components/ModActions";

export const revalidate = 0;

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      posts: {
        orderBy: { createdAt: "asc" },
        include: { author: true, _count: { select: { likes: true } } },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!thread) notFound();

  // Increment views
  await prisma.thread.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/" className="hover:text-gray-400">Home</Link>
        <span>/</span>
        <Link href={`/category/${thread.category.slug}`} className="hover:text-gray-400">
          {thread.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{thread.title}</span>
      </div>

      {/* Thread header */}
      <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e1e1e] bg-[#0f0f0f]">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              backgroundColor: thread.category.color + "22",
              color: thread.category.color,
            }}
          >
            {thread.category.name}
          </span>
          {thread.isPinned && (
            <span className="text-[10px] bg-[#6366f1]/20 text-[#6366f1] px-1.5 py-0.5 rounded font-bold">PINNED</span>
          )}
          {thread.isLocked && (
            <span className="text-[10px] bg-red-900/20 text-red-400 px-1.5 py-0.5 rounded font-bold">LOCKED</span>
          )}
          <div className="ml-auto flex items-center gap-3 text-[11px] text-gray-600">
            <span>{thread.views} views</span>
            <span>{thread._count.likes} likes</span>
          </div>
        </div>

        <div className="flex gap-0">
          {/* Author sidebar */}
          <div className="w-32 shrink-0 bg-[#0f0f0f] border-r border-[#1e1e1e] p-4 flex flex-col items-center hidden sm:flex">
            <UserBadge
              username={thread.author.username}
              rank={thread.author.rank}
              postCount={thread.author.postCount}
              credits={thread.author.credits}
            />
          </div>
          {/* Post content */}
          <div className="flex-1 p-5">
            <h1 className="text-xl font-bold text-white mb-4">{thread.title}</h1>
            <div className="post-content text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {thread.content}
            </div>
            <p className="text-[11px] text-gray-600 mt-4">
              Posted{" "}
              {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Replies */}
      {thread.posts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            {thread.posts.length} {thread.posts.length === 1 ? "Reply" : "Replies"}
          </h2>
          {thread.posts.map((post, idx) => (
            <div
              key={post.id}
              className="bg-[#131313] border border-[#1e1e1e] rounded-xl overflow-hidden flex"
            >
              <div className="w-32 shrink-0 bg-[#0f0f0f] border-r border-[#1e1e1e] p-4 hidden sm:flex flex-col items-center">
                <UserBadge
                  username={post.author.username}
                  rank={post.author.rank}
                  postCount={post.author.postCount}
                  credits={post.author.credits}
                />
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">#{idx + 1}</span>
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="post-content text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <span className="text-[11px] text-gray-600">
                    {post._count.likes} likes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mod actions */}
      {session && (session.user.role === "ADMIN" || session.user.role === "MODERATOR") && (
        <ModActions
          threadId={thread.id}
          isPinned={thread.isPinned}
          isLocked={thread.isLocked}
        />
      )}

      {/* Reply form */}
      {session && !thread.isLocked && (
        <ReplyForm threadId={thread.id} />
      )}
      {!session && (
        <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm">
            <Link href="/login" className="text-[#6366f1] hover:underline">Login</Link>
            {" "}or{" "}
            <Link href="/register" className="text-[#6366f1] hover:underline">Register</Link>
            {" "}to reply.
          </p>
        </div>
      )}
      {thread.isLocked && (
        <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm">This thread is locked.</p>
        </div>
      )}
    </div>
  );
}
