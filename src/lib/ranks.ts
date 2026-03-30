export const RANKS = [
  { name: "Newbie", minPosts: 0, color: "#9ca3af" },
  { name: "Member", minPosts: 10, color: "#60a5fa" },
  { name: "Regular", minPosts: 50, color: "#34d399" },
  { name: "Veteran", minPosts: 200, color: "#f59e0b" },
  { name: "Elite", minPosts: 500, color: "#f97316" },
  { name: "Legend", minPosts: 1000, color: "#ef4444" },
  { name: "God", minPosts: 5000, color: "#a855f7" },
];

export function getRank(postCount: number): string {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (postCount >= r.minPosts) rank = r.name;
  }
  return rank;
}

export function getRankColor(rank: string): string {
  return RANKS.find((r) => r.name === rank)?.color ?? "#9ca3af";
}
