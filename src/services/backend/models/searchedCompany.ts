// Types for the SearchedCompany and SiteMatch tables

export interface SearchedCompany {
	id: number;
	search_id: string;
	searched_company: string;
	country: string;
	website: string;
	overall_status: string;
	start_time: Date;
	end_time: Date;
	datasource_link: string;
	datasource_quality: string;
	datasource_qualityexplanation: string;
	business_description: string;
	product_service_description: string;
	functional_profile_description: string;
	corporatestructureandaffiliations_summary: string;
	productservicecomparability_status: string;
	productservicecomparability_explanation: string;
	functionalprofilecomparability_status: string;
	functionalprofilecomparability_explanation: string;
	independence_status: string;
	independence_explanation: string;
	comparability_analysis_status: string;
	auth_code: string;
	zip_link: string;
	pdf_link: string;
	default_business_description: string;
	default_product_service_description: string;
	default_functional_profile_description: string;
	default_corporatestructureandaffiliations_summary: string;
	default_productservicecomparability_explanation: string;
	default_functionalprofilecomparability_explanation: string;
	default_independence_explanation: string;
	ideal_product_service: string;
	ideal_functional_profile: string;
	language: string;
	comparability_analysis_start_time: Date;
	comparability_analysis_end_time: Date;
	analysis_method: string;
	site_match?: SiteMatch;
}

export interface SiteMatch {
	id: number;
	bvd_id: string;
	street_and_number: string;
	address_line: string;
	search_id: string;
	status: string;
	name_match_status: string;
	name_match_notes: string;
	name_match_website_extracted_data: string;
	registration_id_match_status: string;
	registration_id_match_notes: string;
	registration_id_match_website_extracted_data: string;
	address_match_status: string;
	address_match_notes: string;
	address_match_website_extracted_data: string;
	description_match_status: string;
	description_match_notes: string;
	description_match_website_extracted_data: string;
	overall_result: string;
	explanation: string;
}
