import { useEffect, useState, useMemo } from "react";
import { useConfig } from "@/hooks/use-config";
import { useMetricsHistory } from "@/hooks/use-metrics";
import { useSocket } from "@/hooks/use-socket";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfigPanel } from "@/components/ConfigPanel";
import { RttChart, ThroughputChart } from "@/components/Charts";
import { type MetricSample, type DashboardUpdate } from "@shared/schema";
import { 
  Activity, 
  Wifi, 
  Zap, 
  Box, 
  AlertTriangle, 
  Settings2,
  Database,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const HISTORY_LENGTH = 60; // Keep last 60 points for 1-minute view

export default function Dashboard() {
  const { data: config, isLoading: isConfigLoading } = useConfig();
  const { data: history, isLoading: isHistoryLoading } = useMetricsHistory();
  const { isConnected, lastUpdate } = useSocket();
  const [metricHistory, setMetricHistory] = useState<MetricSample[]>([]);
  const [configOpen, setConfigOpen] = useState(false);

  // Initialize history from API, then switch to socket updates
  useEffect(() => {
    if (history) {
      setMetricHistory(history);
    }
  }, [history]);

  // Process socket updates
  useEffect(() => {
    if (lastUpdate) {
      setMetricHistory(prev => {
        const next = [...prev, lastUpdate.metrics];
        // Keep fixed window size
        if (next.length > HISTORY_LENGTH) {
          return next.slice(next.length - HISTORY_LENGTH);
        }
        return next;
      });
    }
  }, [lastUpdate]);

  // Derived state for current values
  const currentMetrics = lastUpdate?.metrics;
  const controllerState = lastUpdate?.controller;
  
  // Use last history point if socket hasn't pushed yet (on first load)
  const displayMetrics = currentMetrics || (metricHistory.length > 0 ? metricHistory[metricHistory.length - 1] : null);

  const formattedUtilization = displayMetrics 
    ? displayMetrics.utilizationPct.toFixed(1) 
    : "0.0";
    
  const formattedLoss = displayMetrics 
    ? displayMetrics.lossPct.toFixed(2) 
    : "0.00";

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground p-4 md:p-6 lg:p-8 space-y-8">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white text-glow">
              NetPulse
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm pl-1">
            Adaptive Network Control System
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">System Time</span>
             <span className="font-mono text-sm">{new Date().toLocaleTimeString()}</span>
          </div>
          <StatusBadge 
            active={isConnected} 
            label={isConnected ? "Connected" : "Reconnecting..."} 
            color={isConnected ? "cyan" : "rose"}
          />
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Current Rate"
          value={controllerState?.currentRate ?? 0}
          unit="RPS"
          icon={Zap}
          className="border-primary/20"
        />
        <MetricCard 
          title="Bucket Level"
          value={`${controllerState?.bucketTokens.toFixed(0) ?? 0}`}
          unit={`/ ${controllerState?.bucketCapacity ?? 100}`}
          icon={Box}
          className="border-primary/20"
        />
        <MetricCard 
          title="Interface Util"
          value={formattedUtilization}
          unit="%"
          icon={Wifi}
          alert={Number(formattedUtilization) > (config?.utilizationThresholdPct ?? 80)}
        />
        <MetricCard 
          title="Packet Loss"
          value={formattedLoss}
          unit="%"
          icon={AlertTriangle}
          alert={Number(formattedLoss) > (config?.lossThresholdPct ?? 2)}
        />
      </div>

      {/* CONGESTION STATUS */}
      <div className="bg-card/30 border border-border/50 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          Congestion Indicators
        </h3>
        <div className="flex gap-4">
          <StatusBadge 
            active={controllerState?.congestionReason.rttIncrease ?? false} 
            label="High Latency" 
            color="rose" 
          />
          <StatusBadge 
            active={controllerState?.congestionReason.lossHigh ?? false} 
            label="Packet Loss" 
            color="rose" 
          />
          <StatusBadge 
            active={controllerState?.congestionReason.utilHigh ?? false} 
            label="Bandwidth Saturation" 
            color="amber" 
          />
          <StatusBadge 
            active={!controllerState?.isCongested} 
            label="Network Stable" 
            color="emerald" 
          />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Latency (RTT)
            </h3>
            <span className="text-2xl font-mono font-bold text-primary">
              {displayMetrics?.rttMs?.toFixed(0) ?? "--"} <span className="text-xs text-muted-foreground">ms</span>
            </span>
          </div>
          <div className="flex-1 min-h-0">
             <RttChart data={metricHistory} className="h-full w-full" />
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Throughput
            </h3>
            <div className="flex gap-4 font-mono text-sm">
              <span className="flex items-center gap-1 text-emerald-400">
                <ArrowDownRight className="w-3 h-3" />
                {displayMetrics?.rxMbps?.toFixed(1) ?? "--"} Mbps
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <ArrowUpRight className="w-3 h-3" />
                {displayMetrics?.txMbps?.toFixed(1) ?? "--"} Mbps
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
             <ThroughputChart data={metricHistory} className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* CONFIGURATION PANEL */}
      <Collapsible 
        open={configOpen} 
        onOpenChange={setConfigOpen}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold tracking-tight">System Configuration</h2>
           <CollapsibleTrigger asChild>
             <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10">
               <Settings2 className="w-4 h-4" />
               {configOpen ? "Hide Settings" : "Configure Controller"}
             </Button>
           </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-4 data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden transition-all">
           {isConfigLoading ? (
             <div className="h-32 flex items-center justify-center text-muted-foreground">Loading config...</div>
           ) : config ? (
             <ConfigPanel currentConfig={config} />
           ) : (
             <div className="h-32 flex items-center justify-center text-rose-400">Failed to load configuration</div>
           )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
