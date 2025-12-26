import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConfigSchema, type AppConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUpdateConfig } from "@/hooks/use-config";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

// Ensure numbers are coerced correctly from string inputs
const formSchema = insertConfigSchema.extend({
  initialRateRps: z.coerce.number(),
  minRateRps: z.coerce.number(),
  maxRateRps: z.coerce.number(),
  rttIncreaseThresholdMs: z.coerce.number(),
  lossThresholdPct: z.coerce.number(),
  utilizationThresholdPct: z.coerce.number(),
  controlIntervalSec: z.coerce.number(),
  bucketCapacity: z.coerce.number(),
  bucketRefillPerSec: z.coerce.number(),
});

interface ConfigPanelProps {
  currentConfig: AppConfig;
}

export function ConfigPanel({ currentConfig }: ConfigPanelProps) {
  const { toast } = useToast();
  const updateConfig = useUpdateConfig();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: currentConfig,
  });

  // Update form when remote config changes
  useEffect(() => {
    form.reset(currentConfig);
  }, [currentConfig, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateConfig.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Configuration Saved",
          description: "Network controller parameters updated successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Update Failed",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full"></span>
          Controller Configuration
        </CardTitle>
        <CardDescription>
          Adjust traffic shaping and congestion control parameters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Rate Limits Group */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary font-mono uppercase tracking-wider border-b border-border/50 pb-2">Rate Limits (RPS)</h4>
              
              <div className="space-y-2">
                <Label htmlFor="initialRateRps">Initial Rate</Label>
                <Input {...form.register("initialRateRps")} type="number" className="font-mono" />
                <p className="text-[10px] text-muted-foreground">Starting requests/sec on boot</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minRateRps">Minimum Rate</Label>
                <Input {...form.register("minRateRps")} type="number" className="font-mono" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRateRps">Maximum Rate</Label>
                <Input {...form.register("maxRateRps")} type="number" className="font-mono" />
              </div>
            </div>

            {/* Thresholds Group */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary font-mono uppercase tracking-wider border-b border-border/50 pb-2">Congestion Thresholds</h4>
              
              <div className="space-y-2">
                <Label htmlFor="rttIncreaseThresholdMs">RTT Threshold (ms)</Label>
                <Input {...form.register("rttIncreaseThresholdMs")} type="number" className="font-mono" />
                <p className="text-[10px] text-muted-foreground">Latency spike trigger</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lossThresholdPct">Packet Loss (%)</Label>
                <Input {...form.register("lossThresholdPct")} type="number" className="font-mono" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilizationThresholdPct">Utilization (%)</Label>
                <Input {...form.register("utilizationThresholdPct")} type="number" className="font-mono" />
              </div>
            </div>

            {/* Token Bucket Group */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary font-mono uppercase tracking-wider border-b border-border/50 pb-2">Token Bucket</h4>
              
              <div className="space-y-2">
                <Label htmlFor="bucketCapacity">Capacity (tokens)</Label>
                <Input {...form.register("bucketCapacity")} type="number" className="font-mono" />
                <p className="text-[10px] text-muted-foreground">Burst tolerance size</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bucketRefillPerSec">Refill Rate (/sec)</Label>
                <Input {...form.register("bucketRefillPerSec")} type="number" className="font-mono" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="controlIntervalSec">Control Loop (sec)</Label>
                <Input {...form.register("controlIntervalSec")} type="number" className="font-mono" />
              </div>
            </div>
            
             {/* Network Settings */}
             <div className="space-y-4">
              <h4 className="text-sm font-semibold text-primary font-mono uppercase tracking-wider border-b border-border/50 pb-2">Network Target</h4>
              
              <div className="space-y-2">
                <Label htmlFor="pingHost">Ping Host</Label>
                <Input {...form.register("pingHost")} className="font-mono" placeholder="8.8.8.8" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interface">Network Interface</Label>
                <Input {...form.register("interface")} className="font-mono" placeholder="Auto" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button 
              type="submit" 
              disabled={updateConfig.isPending || !form.formState.isDirty}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20"
            >
              {updateConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Apply Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
