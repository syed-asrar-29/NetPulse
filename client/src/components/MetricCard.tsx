import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  alert?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  className,
  alert = false,
}: MetricCardProps) {
  return (
    <Card 
      className={cn(
        "bg-card/50 backdrop-blur-md border-border/50 shadow-lg transition-all duration-300 hover:border-primary/50",
        alert && "border-rose-500/50 shadow-rose-500/10",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", alert ? "text-rose-400" : "text-primary")} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className={cn("text-2xl font-bold font-display tracking-tight", alert ? "text-rose-100" : "text-foreground")}>
            {value}
          </div>
          {unit && (
            <span className="text-xs text-muted-foreground font-mono">{unit}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
