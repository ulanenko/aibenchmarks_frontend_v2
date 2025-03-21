/**
 * Types for company analysis API requests
 */

/**
 * Site match information for a company
 */
export interface SiteMatch {
	/**
	 * BVD ID of the company
	 */
	bvdId?: string;

	/**
	 * Street and number of the company address
	 */
	street_and_number?: string;

	/**
	 * Full address line of the company
	 */
	address_line?: string;
}

/**
 * Analysis information for a single company
 */
export interface AnalyzeCompany {
	/**
	 * Analysis company name
	 */
	company_name: string;

	/**
	 * Analysis country of a company
	 */
	country: string;

	/**
	 * Analysis website url of a company
	 */
	website: string;

	/**
	 * Boolean value that decides if the vendor API should take a screenshot of the scraped company
	 */
	is_screenshot: boolean;

	/**
	 * Language of the analysis
	 */
	lang: string;

	/**
	 * Whether to use database descriptions
	 */
	use_database_descriptions?: boolean;

	/**
	 * Trade description from database
	 */
	database_trade_description?: string | null;

	/**
	 * Full overview from database
	 */
	database_full_overview?: string | null;

	/**
	 * Optional site match information for the company
	 */
	site_match?: SiteMatch;
}

/**
 * Input data for company analysis
 */
export interface AnalyzeCompanyInput {
	/**
	 * User authorization value
	 */
	auth_code: number;

	/**
	 * List of companies to analyze
	 */
	analysis: AnalyzeCompany[];
}

/**
 * Response from the company analysis API (detailed data for a specific analysis)
 */
export interface AnalyzeCompanyAPIResponse {
	/**
	 * The company name that was analyzed
	 */
	company_name: string;

	/**
	 * List of error messages if any occurred during analysis
	 */
	error_message?: string[];

	/**
	 * The unique search ID assigned to this analysis
	 */
	search_id?: string;
}

/**
 * Response from the company analysis initiation API endpoint
 */
export interface ComparabilityCompanyAPIResponse {
	/**
	 * Result message from the API
	 */
	message: string;

	/**
	 * List of unique company search IDs generated for the analyses
	 */
	search_ids: string[];
}
