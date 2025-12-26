import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  label: string;
  color?: "emerald" | "rose" | "cyan" | "amber";
}

export function StatusBadge({ active, label, color = "emerald" }: StatusBadgeProps) {
  const colorMap = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300",
        active ? colorMap[color] : "bg-secondary text-muted-foreground border-transparent opacity-50"
      )}
    >
      <span className={cn(
        "relative flex h-2 w-2",
        active && "animate-pulse"
      )}>
        {active && (
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            color === "emerald" && "bg-emerald-400",
            color === "rose" && "bg-rose-400",
            color === "cyan" && "bg-cyan-400",
            color === "amber" && "bg-amber-400",
          )}></span>
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          active ? (
            color === "emerald" ? "bg-emerald-500" :
            color === "rose" ? "bg-rose-500" :
            color === "cyan" ? "bg-cyan-500" : "bg-amber-500"
          ) : "bg-gray-500"
        )}></span>
      </span>
      <span className="font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}
