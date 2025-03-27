import { z } from 'zod';

// Zod schemas for validation
export const strategyWizardRequestSchema = z.object({
  company_description: z.string(),
});

// The raw response from the API uses snake_case
export const strategyWizardRawResponseSchema = z.object({
  ideal_functional_profile: z.string().nullable().optional(),
  ideal_products_services: z.string().nullable().optional(),
  reject_functions_activities: z.string().nullable().optional(),
  reject_products_services: z.string().nullable().optional(),
  most_probable_language: z.string().nullable().optional(),
});

// The transformed response uses camelCase matching our frontend
export const strategyWizardResponseSchema = z.object({
  idealFunctionalProfile: z.string().nullable().optional(),
  idealProducts: z.string().nullable().optional(),
  rejectFunctions: z.string().nullable().optional(),
  rejectProducts: z.string().nullable().optional(),
  mostProbableLanguage: z.string().nullable().optional(),
});

// Type definitions inferred from Zod schemas
export type StrategyWizardRequest = z.infer<typeof strategyWizardRequestSchema>;
export type StrategyWizardRawResponse = z.infer<typeof strategyWizardRawResponseSchema>;
export type StrategyWizardResponse = z.infer<typeof strategyWizardResponseSchema>; 