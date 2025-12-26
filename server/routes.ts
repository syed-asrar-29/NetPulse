import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { NetPulseService } from "./services/netpulse";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize NetPulse Service
  const netPulse = new NetPulseService(storage);
  netPulse.start();

  // WebSocket Setup
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    // Send immediate initial state
    const state = netPulse.getLatestUpdate();
    if (state) {
      ws.send(JSON.stringify(state));
    }

    // Subscribe to updates
    const removeListener = netPulse.subscribe((update) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(update));
      }
    });

    ws.on("close", () => {
      removeListener();
    });
  });

  // REST API Routes
  app.get(api.config.get.path, async (req, res) => {
    const config = await storage.getConfig();
    res.json(config);
  });

  app.post(api.config.update.path, async (req, res) => {
    try {
      const input = api.config.update.input.parse(req.body);
      const config = await storage.updateConfig(input);
      netPulse.updateConfig(config); // Update live service
      res.json(config);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.metrics.history.path, async (req, res) => {
    const history = netPulse.getHistory();
    res.json(history);
  });

  return httpServer;
}
