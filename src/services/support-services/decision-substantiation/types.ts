import { z } from 'zod';
import { strategyBaseSchema } from '@/lib/strategy/fields';

// Define the strategy schema without the name field
export const decisionStrategySchema = z.object({
  idealFunctionalProfile: z.string().nullable().optional(),
  idealProducts: z.string().nullable().optional(),
  rejectFunctions: z.string().nullable().optional(),
  rejectProducts: z.string().nullable().optional(),
  relaxedProduct: z.boolean().default(true),
  relaxedFunction: z.boolean().default(true),
  disabledIndependence: z.boolean().default(false),
});

// Request schema for the decision substantiation API
export const decisionSubstantiationRequestSchema = z.object({
  search_id: z.string(),
  strategy: decisionStrategySchema,
});

// Raw response schema from the API (using snake_case)
export const decisionSubstantiationRawResponseSchema = z.object({
  company_name: z.string().nullable().optional(),
  company_description: z.string().nullable().optional(),
  match_score: z.number().nullable().optional(),
  substantiation: z.string().nullable().optional(),
  functions_matches: z.array(z.string()).nullable().optional(),
  product_matches: z.array(z.string()).nullable().optional(),
});

// Transformed response schema for frontend (using camelCase)
export const decisionSubstantiationResponseSchema = z.object({
  companyName: z.string().nullable().optional(),
  companyDescription: z.string().nullable().optional(),
  matchScore: z.number().nullable().optional(),
  substantiation: z.string().nullable().optional(),
  functionsMatches: z.array(z.string()).nullable().optional(),
  productMatches: z.array(z.string()).nullable().optional(),
});

// Type definitions inferred from Zod schemas
export type DecisionStrategy = z.infer<typeof decisionStrategySchema>;
export type DecisionSubstantiationRequest = z.infer<typeof decisionSubstantiationRequestSchema>;
export type DecisionSubstantiationRawResponse = z.infer<typeof decisionSubstantiationRawResponseSchema>;
export type DecisionSubstantiationResponse = z.infer<typeof decisionSubstantiationResponseSchema>; 