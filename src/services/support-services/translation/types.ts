import { z } from 'zod';

// Request schema for the translation API
export const translateRequestSchema = z.object({
  text: z.string(),
  target_language: z.string()
});

// Raw response schema from the API
export const translateRawResponseSchema = z.object({
  translated_text: z.string().nullable().optional(),
  source_language: z.string().nullable().optional()
});

// Type definitions inferred from Zod schemas
export type TranslateRequest = z.infer<typeof translateRequestSchema>;
export type TranslateRawResponse = z.infer<typeof translateRawResponseSchema>; 