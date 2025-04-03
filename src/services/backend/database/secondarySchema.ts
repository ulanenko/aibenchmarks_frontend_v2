import {pgTable, integer, text, timestamp} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

// SearchedCompany table schema
export const searchedCompany = pgTable('searched_company', {
	id: integer('id').primaryKey(),
	search_id: text('search_id').unique().notNull(),
	searched_company: text('searched_company'),
	country: text('country'),
	website: text('website'),
	overall_status: text('overall_status'),
	start_time: timestamp('start_time'),
	end_time: timestamp('end_time'),
	datasource_link: text('datasource_link'),
	datasource_quality: text('datasource_quality'),
	datasource_qualityexplanation: text('datasource_qualityexplanation'),
	business_description: text('business_description'),
	product_service_description: text('product_service_description'),
	functional_profile_description: text('functional_profile_description'),
	corporatestructureandaffiliations_summary: text('corporatestructureandaffiliations_summary'),
	productservicecomparability_status: text('productservicecomparability_status'),
	productservicecomparability_explanation: text('productservicecomparability_explanation'),
	functionalprofilecomparability_status: text('functionalprofilecomparability_status'),
	functionalprofilecomparability_explanation: text('functionalprofilecomparability_explanation'),
	independence_status: text('independence_status'),
	independence_explanation: text('independence_explanation'),
	comparability_analysis_status: text('comparability_analysis_status'),
	auth_code: text('auth_code'),
	zip_link: text('zip_link'),
	pdf_link: text('pdf_link'),
	default_business_description: text('default_business_description'),
	default_product_service_description: text('default_product_service_description'),
	default_functional_profile_description: text('default_functional_profile_description'),
	default_corporatestructureandaffiliations_summary: text('default_corporatestructureandaffiliations_summary'),
	default_productservicecomparability_explanation: text('default_productservicecomparability_explanation'),
	default_functionalprofilecomparability_explanation: text('default_functionalprofilecomparability_explanation'),
	default_independence_explanation: text('default_independence_explanation'),
	ideal_product_service: text('ideal_product_service'),
	ideal_functional_profile: text('ideal_functional_profile'),
	language: text('language'),
	comparability_analysis_start_time: timestamp('comparability_analysis_start_time'),
	comparability_analysis_end_time: timestamp('comparability_analysis_end_time'),
	analysis_method: text('analysis_method'),
});

// SiteMatch table schema
export const siteMatch = pgTable('site_match', {
	id: integer('id').primaryKey(),
	bvd_id: text('bvd_id'),
	street_and_number: text('street_and_number'),
	address_line: text('address_line'),
	search_id: text('search_id').references(() => searchedCompany.search_id),
	status: text('status'),
	name_match_status: text('name_match_status'),
	name_match_notes: text('name_match_notes'),
	name_match_website_extracted_data: text('name_match_website_extracted_data'),
	registration_id_match_status: text('registration_id_match_status'),
	registration_id_match_notes: text('registration_id_match_notes'),
	registration_id_match_website_extracted_data: text('registration_id_match_website_extracted_data'),
	address_match_status: text('address_match_status'),
	address_match_notes: text('address_match_notes'),
	address_match_website_extracted_data: text('address_match_website_extracted_data'),
	description_match_status: text('description_match_status'),
	description_match_notes: text('description_match_notes'),
	description_match_website_extracted_data: text('description_match_website_extracted_data'),
	overall_result: text('overall_result'),
	explanation: text('explanation'),
});

// ScrapedWebsite table schema
export const scrapedWebsite = pgTable('scraped_websites', {
	id: integer('id').primaryKey(),
	searched_company: text('searched_company'),
	url: text('url'),
	content: text('content'),
	screenshot: text('screenshot'),
	search_id: text('search_id').references(() => searchedCompany.search_id),
	auth_code: text('auth_code'),
	accessed_on: timestamp('accessed_on', { withTimezone: true }),
	screenshot_status: text('screenshot_status'),
	page_title: text('page_title'),
});

// Relationships
export const searchedCompanyRelations = relations(searchedCompany, ({one, many}) => ({
	siteMatch: one(siteMatch, {
		fields: [searchedCompany.search_id],
		references: [siteMatch.search_id],
	}),
	scrapedWebsites: many(scrapedWebsite),
}));

export const siteMatchRelations = relations(siteMatch, ({one}) => ({
	searchedCompany: one(searchedCompany, {
		fields: [siteMatch.search_id],
		references: [searchedCompany.search_id],
	}),
}));

export const scrapedWebsiteRelations = relations(scrapedWebsite, ({one}) => ({
	searchedCompany: one(searchedCompany, {
		fields: [scrapedWebsite.search_id],
		references: [searchedCompany.search_id],
	}),
}));
