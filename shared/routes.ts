import { z } from 'zod';
import { insertConfigSchema, configs, metricSampleSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  config: {
    get: {
      method: 'GET' as const,
      path: '/api/config',
      responses: {
        200: z.custom<typeof configs.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/config',
      input: insertConfigSchema,
      responses: {
        200: z.custom<typeof configs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  metrics: {
    history: {
      method: 'GET' as const,
      path: '/api/metrics/history',
      responses: {
        200: z.array(metricSampleSchema),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ConfigInput = z.infer<typeof api.config.update.input>;
