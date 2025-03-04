import {z} from 'zod';

// Source column definition
export interface SourceColumn {
	title: string;
	key: string;
	type: string;
	options: string;
	samples?: string[];
}

// Target option definition
export interface TargetOption {
	value: string;
	label: string;
	description: string;
}

// Input DTO for the mapper
export interface MapperInput {
	sourceColumns: SourceColumn[];
	targetOptions: TargetOption[];
}

// Result item from the AI mapper
export interface AIMapperResultItem {
	target_option_value: string; // this is the target data
	source_column_key: string; // this is the input (source data), can be empty if it cannot find anything
	confidence?: string; // high, low, n/a
	explanation?: string;
}

// Complete results from the AI mapper
export interface AIMapperResults {
	ai_mapper_items: Record<string, AIMapperResultItem>;
}

// Website validation DTOs
export interface DTO_ValidateAndFindWebsiteRequest {
	company_name: string;
	country: string;
	database_url?: string;
}

export interface DTO_ValidateAndFindWebsiteResponse {
	validation_passed: boolean;
	official_url: string;
	replaced: boolean;
	finetuned: boolean;
}

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
