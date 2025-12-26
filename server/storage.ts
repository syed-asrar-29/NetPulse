import { db } from "./db";
import {
  configs,
  type AppConfig,
  type InsertAppConfig,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getConfig(): Promise<AppConfig>;
  updateConfig(config: InsertAppConfig): Promise<AppConfig>;
}

export class DatabaseStorage implements IStorage {
  async getConfig(): Promise<AppConfig> {
    const [config] = await db.select().from(configs).limit(1);
    if (config) return config;
    
    // Create default if none exists
    const [newConfig] = await db.insert(configs).values({}).returning();
    return newConfig;
  }

  async updateConfig(update: InsertAppConfig): Promise<AppConfig> {
    const current = await this.getConfig();
    const [updated] = await db
      .update(configs)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(configs.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
