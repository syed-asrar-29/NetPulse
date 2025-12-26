import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMetricsHistory() {
  return useQuery({
    queryKey: [api.metrics.history.path],
    queryFn: async () => {
      const res = await fetch(api.metrics.history.path);
      if (!res.ok) throw new Error("Failed to fetch metrics history");
      return api.metrics.history.responses[200].parse(await res.json());
    },
    refetchOnMount: true,
  });
}
