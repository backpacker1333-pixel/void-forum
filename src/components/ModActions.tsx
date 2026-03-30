"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  threadId: string;
  isPinned: boolean;
  isLocked: boolean;
}

export default function ModActions({ threadId, isPinned, isLocked }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function action(act: string) {
    setLoading(act);
    await fetch("/api/admin/threads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, action: act }),
    });
    setLoading(null);
    if (act === "delete") {
      router.push("/");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="bg-[#131313] border border-[#1e1e1e] rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Moderation
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => action(isPinned ? "unpin" : "pin")}
          disabled={loading !== null}
          className="text-xs bg-[#6366f1]/20 hover:bg-[#6366f1]/40 text-[#6366f1] px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {loading === "pin" || loading === "unpin"
            ? "..."
            : isPinned
            ? "Unpin"
            : "Pin"}
        </button>
        <button
          onClick={() => action(isLocked ? "unlock" : "lock")}
          disabled={loading !== null}
          className="text-xs bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {loading === "lock" || loading === "unlock"
            ? "..."
            : isLocked
            ? "Unlock"
            : "Lock"}
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this thread permanently?")) action("delete");
          }}
          disabled={loading !== null}
          className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {loading === "delete" ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
