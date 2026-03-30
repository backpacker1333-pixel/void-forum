"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string;
}

function NewThreadForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  if (status === "loading") return null;
  if (!session) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-gray-500">
          <Link href="/login" className="text-[#6366f1] hover:underline">Login</Link>{" "}
          to create a thread.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, categoryId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error creating thread");
      return;
    }

    const thread = await res.json();
    router.push(`/thread/${thread.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/" className="hover:text-gray-400">Home</Link>
        <span>/</span>
        <span className="text-gray-400">New Thread</span>
      </div>

      <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-6">
        <h1 className="text-lg font-bold text-white mb-5">Create New Thread</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#6366f1] rounded-lg px-4 py-2.5 text-sm text-gray-200 outline-none transition"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Enter a descriptive title..."
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#6366f1] rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              placeholder="Write your thread content..."
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] focus:border-[#6366f1] rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none resize-y transition"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/10 border border-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-600">+5 credits for posting</p>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
            >
              {loading ? "Posting..." : "Post Thread"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={null}>
      <NewThreadForm />
    </Suspense>
  );
}
