import {pgTable, text, serial, timestamp, integer, boolean, json, jsonb, pgEnum} from 'drizzle-orm/pg-core';

export type StepStatus =
	| 'not_ready'
	| 'input_required'
	| 'ready'
	| 'in_progress'
	| 'completed'
	| 'decision'
	| 'reviewed'
	| 'failed';

export const stepStatusEnum = pgEnum('step_status', [
	'not_ready',
	'not_started',
	'input_required',
	'ready',
	'pending',
	'in_progress',
	'completed',
	'reviewed',
	'failed',
]);

// Base configuration with common fields
const baseFields = {
	id: serial('id').primaryKey(),
	createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', {withTimezone: true}),
} as const;

// Base configuration for step fields
const stepFields = {
	...baseFields,
	stepStatus: stepStatusEnum('step_status'),
	initiatedBy: text('initiated_by'),
	startedAt: timestamp('started_at', {withTimezone: true}),
	completedAt: timestamp('completed_at', {withTimezone: true}),
	error: text('error'),
	notes: text('notes'),
} as const;

export const test = pgTable('test', {
	id: serial('id').primaryKey(),
	test: text('test'),
});

export const benchmark = pgTable('bm_benchmark', {
	...baseFields,
	name: text('name').notNull(),
	clientId: integer('client_id').references(() => client.id),
	userId: integer('user_id')
		.references(() => user.id)
		.notNull(),
	year: integer('year').notNull(),
	lang: text('lang'),
	mappingSettings: jsonb('mapping_settings'),
	strategy: jsonb('strategy'),
});

export const client = pgTable('bm_client', {
	...baseFields,
	name: text('name').notNull(),
	description: text('description'),
});

export const user = pgTable('bm_user', {
	...baseFields,
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	isAdmin: boolean('is_admin').notNull().default(false),
	password: text('password').notNull(),
});

export const company = pgTable('bm_company', {
	...baseFields,
	benchmarkId: integer('benchmark_id')
		.references(() => benchmark.id, {onDelete: 'cascade'})
		.notNull(),
	// Core company information
	name: text('name'),
	databaseId: text('database_id'),
	country: text('country'),
	url: text('url'),
	streetAndNumber: text('street_and_number'),
	addressLine1: text('address_line_1'),
	consolidationCode: text('consolidation_code'),
	independenceIndicator: text('independence_indicator'),
	naceRev2: text('nace_rev_2'),
	// Company descriptions
	fullOverview: text('full_overview'),
	fullOverviewManual: text('full_overview_manual'),
	tradeDescriptionEnglish: text('trade_description_english'),
	tradeDescriptionOriginal: text('trade_description_original'),
	mainActivity: text('main_activity'),
	mainProductsAndServices: text('main_products_and_services'),
	// Metadata
	sourceData: json('source_data'),
	mappedSourceData: json('mapped_source_data'),
	// Status tracking
	// dataStatus: stepStatusEnum('data_status'),

	urlValidationUrl: text('url_validated'),
	urlValidationInput: text('url_validated_input'),
	urlValidationValid: boolean('url_validated_and_accessible'),

	siteMatchRiskIgnored: boolean('site_match_risk_ignored').default(false),

	// Search analysis data
	searchId: text('search_id'),

	// Manual status and description fields
	cfSufficientDataHRDecision: text('sufficient_data_status_manual'),
	cfSufficientDataHRMotiviation: text('sufficient_data_description_manual'),
	
	cfProductsServicesHRDecision: text('products_services_status_manual'),
	cfProductsServicesHRMotivation: text('products_services_description_manual'),
	
	cfFunctionalProfileHRDecision: text('functional_status_manual'),
	cfFunctionalProfileHRMotivation: text('functional_description_manual'),
	
	cfIndependenceHRDecision: text('independence_status_manual'),
	cfIndependenceHRMotivation: text('independence_description_manual'),
	
});

export const strategy = pgTable('bm_strategy', {
	...baseFields,
	userId: integer('user_id')
		.references(() => user.id)
		.notNull(),
	name: text('name').notNull(),
	idealFunctionalProfile: text('ideal_functional_profile'),
	idealProducts: text('ideal_products_services'),
	rejectFunctions: text('reject_functions_activities'),
	rejectProducts: text('reject_products_services'),
	relaxedProduct: boolean('relaxed_product').notNull().default(true),
	relaxedFunction: boolean('relaxed_function').notNull().default(true),
	disabledIndependence: boolean('disabled_independence').notNull().default(false),
});

export interface BaseFields {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date | null;
}

export interface ClientBase extends BaseFields {
	description: string | null;
}

export interface UserBase extends BaseFields {
	email: string;
	isAdmin: boolean;
	password: string;
}

// Drizzle types
export type Strategy = typeof strategy.$inferSelect;
export type StrategyNewDTO = Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>;
