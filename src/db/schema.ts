import {pgTable, text, serial, timestamp, integer, boolean, json, pgEnum} from 'drizzle-orm/pg-core';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export const stepStatusEnum = pgEnum('step_status', ['pending', 'in_progress', 'completed', 'failed']);

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
	dataStatus: stepStatusEnum('data_status'),
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
