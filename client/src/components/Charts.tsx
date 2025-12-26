import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { type MetricSample } from "@shared/schema";
import { format } from "date-fns";

interface ChartProps {
  data: MetricSample[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-xs font-mono">
        <p className="text-muted-foreground mb-2">
          {format(new Date(label), "HH:mm:ss")}
        </p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-foreground font-medium">{p.name}:</span>
            <span className="text-foreground">{p.value.toFixed(2)}</span>
            <span className="text-muted-foreground opacity-75">{p.unit}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RttChart({ data, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(ts) => format(new Date(ts), "mm:ss")}
            stroke="#64748b" 
            fontSize={12}
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="rttMs" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="RTT"
            unit="ms"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ThroughputChart({ data, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(ts) => format(new Date(ts), "mm:ss")}
            stroke="#64748b" 
            fontSize={12}
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="rxMbps" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorRx)" 
            name="Download"
            unit=" Mbps"
            stackId="1"
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="txMbps" 
            stroke="#06b6d4" 
            fillOpacity={1} 
            fill="url(#colorTx)" 
            name="Upload"
            unit=" Mbps"
            stackId="2"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
