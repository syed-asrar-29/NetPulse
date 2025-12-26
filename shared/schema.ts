import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === CONFIGURATION ===
// We'll store config in DB so it persists, but mostly use it in-memory
export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  pingHost: text("ping_host").default("8.8.8.8").notNull(),
  interface: text("interface"), // null = auto-detect
  initialRateRps: integer("initial_rate_rps").default(50).notNull(),
  minRateRps: integer("min_rate_rps").default(5).notNull(),
  maxRateRps: integer("max_rate_rps").default(500).notNull(),
  rttIncreaseThresholdMs: integer("rtt_increase_threshold_ms").default(30).notNull(),
  lossThresholdPct: integer("loss_threshold_pct").default(2).notNull(),
  utilizationThresholdPct: integer("utilization_threshold_pct").default(80).notNull(),
  controlIntervalSec: integer("control_interval_sec").default(1).notNull(),
  bucketCapacity: integer("bucket_capacity").default(200).notNull(),
  bucketRefillPerSec: integer("bucket_refill_per_sec").default(50).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConfigSchema = createInsertSchema(configs).omit({ id: true, updatedAt: true });
export type AppConfig = typeof configs.$inferSelect;
export type InsertAppConfig = z.infer<typeof insertConfigSchema>;

// === REAL-TIME TYPES (Non-DB) ===

export const metricSampleSchema = z.object({
  timestamp: z.number(),
  rttMs: z.number().nullable(),
  lossPct: z.number(),
  txMbps: z.number(),
  rxMbps: z.number(),
  utilizationPct: z.number(),
});

export type MetricSample = z.infer<typeof metricSampleSchema>;

export const controllerStateSchema = z.object({
  currentRate: z.number(),
  bucketTokens: z.number(),
  bucketCapacity: z.number(),
  isCongested: z.boolean(),
  congestionReason: z.object({
    rttIncrease: z.boolean(),
    lossHigh: z.boolean(),
    utilHigh: z.boolean(),
  }),
});

export type ControllerState = z.infer<typeof controllerStateSchema>;

export const dashboardUpdateSchema = z.object({
  timestamp: z.number(),
  metrics: metricSampleSchema,
  controller: controllerStateSchema,
});

export type DashboardUpdate = z.infer<typeof dashboardUpdateSchema>;
