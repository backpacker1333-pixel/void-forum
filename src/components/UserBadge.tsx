import { getRankColor } from "@/lib/ranks";

interface Props {
  username: string;
  rank: string;
  postCount: number;
  credits: number;
  size?: "sm" | "md";
}

export default function UserBadge({
  username,
  rank,
  postCount,
  credits,
  size = "md",
}: Props) {
  const color = getRankColor(rank);
  const isSmall = size === "sm";

  return (
    <div className={`flex flex-col items-center text-center ${isSmall ? "gap-1" : "gap-2"}`}>
      <div
        className={`rounded-full bg-[#1a1a2e] flex items-center justify-center font-bold text-white border-2`}
        style={{
          borderColor: color,
          width: isSmall ? 36 : 52,
          height: isSmall ? 36 : 52,
          fontSize: isSmall ? 14 : 20,
        }}
      >
        {username[0]?.toUpperCase()}
      </div>
      <div>
        <p className={`font-semibold text-white ${isSmall ? "text-xs" : "text-sm"}`}>
          {username}
        </p>
        <p
          className={`font-bold ${isSmall ? "text-[10px]" : "text-xs"}`}
          style={{ color }}
        >
          {rank}
        </p>
        {!isSmall && (
          <p className="text-[10px] text-gray-500">
            {postCount} posts · {credits} cr
          </p>
        )}
      </div>
    </div>
  );
}
