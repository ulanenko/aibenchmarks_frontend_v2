import { z } from 'zod';

// Zod schemas for validation
export const sourceColumnSchema = z.object({
	title: z.string(),
	key: z.string(),
	type: z.string(),
	options: z.string(),
	samples: z.array(z.string()).optional(),
});

export const targetOptionSchema = z.object({
	value: z.string(),
	label: z.string(),
	description: z.string(),
});

export const mapperInputSchema = z.object({
	sourceColumns: z.array(sourceColumnSchema),
	targetOptions: z.array(targetOptionSchema),
});

export const aiMapperResultItemSchema = z.object({
	target_option_value: z.string(),
	source_column_key: z.string(),
	confidence: z.string().optional(),
	explanation: z.string().optional(),
});

export const aiMapperResultsSchema = z.object({
	ai_mapper_items: z.record(z.string(), aiMapperResultItemSchema),
});

// Type definitions inferred from Zod schemas
export type SourceColumn = z.infer<typeof sourceColumnSchema>;
export type TargetOption = z.infer<typeof targetOptionSchema>;
export type MapperInput = z.infer<typeof mapperInputSchema>;
export type AIMapperResultItem = z.infer<typeof aiMapperResultItemSchema>;
export type AIMapperResults = z.infer<typeof aiMapperResultsSchema>;