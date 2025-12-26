import { useState, useEffect, useRef } from "react";
import { dashboardUpdateSchema, type DashboardUpdate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<DashboardUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Simple reconnect logic
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const parsed = dashboardUpdateSchema.safeParse(data);
          
          if (parsed.success) {
            setLastUpdate(parsed.data);
          } else {
            console.warn("Invalid socket message:", parsed.error);
          }
        } catch (err) {
          console.error("Failed to parse socket message", err);
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, lastUpdate };
}
