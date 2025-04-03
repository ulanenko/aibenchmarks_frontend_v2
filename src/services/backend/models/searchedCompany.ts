// Types for the SearchedCompany and SiteMatch tables

export interface SearchedCompany {
	id: number;
	search_id: string | null;
	searched_company: string | null;
	country: string | null;
	website: string | null;
	overall_status: string | null;
	start_time: Date | null;
	end_time: Date | null;
	datasource_link: string | null;
	datasource_quality: string | null;
	datasource_qualityexplanation: string | null;
	business_description: string | null;
	product_service_description: string | null;
	functional_profile_description: string | null;
	corporatestructureandaffiliations_summary: string | null;
	productservicecomparability_status: string | null;
	productservicecomparability_explanation: string | null;
	functionalprofilecomparability_status: string | null;
	functionalprofilecomparability_explanation: string | null;
	independence_status: string | null;
	independence_explanation: string | null;
	comparability_analysis_status: string | null;
	auth_code: string | null;
	zip_link: string | null;
	pdf_link: string | null;
	default_business_description: string | null;
	default_product_service_description: string | null;
	default_functional_profile_description: string | null;
	default_corporatestructureandaffiliations_summary: string | null;
	default_productservicecomparability_explanation: string | null;
	default_functionalprofilecomparability_explanation: string | null;
	default_independence_explanation: string | null;
	ideal_product_service: string | null;
	ideal_functional_profile: string | null;
	language: string | null;
	comparability_analysis_start_time: Date | null;
	comparability_analysis_end_time: Date | null;
	analysis_method: string | null;
	site_match?: SiteMatch;
}

export type SiteMatchStatus = "Likely" | "Possibly" | "Not Likely" | "Uncertain" | "Partial Match" | "No Data" | "No Match"
// partial match and not data are just for the partial status and not for the overall status

export interface SiteMatch {
	id: number;
	bvd_id: string | null;
	street_and_number: string | null;
	address_line: string | null;
	search_id: string | null;
	status: string | null;
	name_match_status: SiteMatchStatus | null;
	name_match_notes: string | null;
	name_match_website_extracted_data: string | null;
	registration_id_match_status: SiteMatchStatus | null;
	registration_id_match_notes: string | null;
	registration_id_match_website_extracted_data: string | null;
	address_match_status: SiteMatchStatus | null;
	address_match_notes: string | null;
	address_match_website_extracted_data: string | null;
	description_match_status: SiteMatchStatus | null;
	description_match_notes: string | null;
	description_match_website_extracted_data: string | null;
	overall_result: SiteMatchStatus | null;
	explanation: string | null;
}
