"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, threadId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error posting reply");
      return;
    }

    setContent("");
    router.refresh();
  }

  return (
    <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3">Post a Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Write your reply..."
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#6366f1] rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none transition"
          required
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">+2 credits for replying</p>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
          >
            {loading ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
