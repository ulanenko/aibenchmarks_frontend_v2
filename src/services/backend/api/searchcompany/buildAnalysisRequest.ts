import {AnalyzeCompany, AnalyzeCompanyInput, SiteMatch} from './types';

/**
 * Builds an analysis request for a single company
 *
 * @param companyName - Name of the company
 * @param country - Country of the company
 * @param website - Website URL of the company
 * @param language - Language for the analysis (default: 'en')
 * @param takeScreenshot - Whether to take a screenshot during analysis (default: true)
 * @param options - Additional options for the analysis
 * @returns An AnalyzeCompany object ready to be included in an analysis request
 */
export function buildCompanyAnalysisRequest(
	companyName: string,
	country: string,
	website: string,
	language: string = 'en',
	takeScreenshot: boolean = true,
	options?: {
		useDbDescriptions?: boolean;
		tradeDatabaseDescription?: string;
		fullDatabaseOverview?: string;
		siteMatch?: {
			bvdId?: string;
			streetAndNumber?: string;
			addressLine?: string;
		};
	},
): AnalyzeCompany {
	// Construct the site match object if provided
	let siteMatch: SiteMatch | undefined;
	if (options?.siteMatch) {
		siteMatch = {
			bvdId: options.siteMatch.bvdId,
			street_and_number: options.siteMatch.streetAndNumber,
			address_line: options.siteMatch.addressLine,
		};
	}

	// Return the constructed AnalyzeCompany object
	return {
		company_name: companyName,
		country: country,
		website: website,
		is_screenshot: takeScreenshot,
		lang: language,
		use_database_descriptions: options?.useDbDescriptions || false,
		database_trade_description: options?.tradeDatabaseDescription || null,
		database_full_overview: options?.fullDatabaseOverview || null,
		site_match: siteMatch,
	};
}

/**
 * Builds a complete company analysis input with authorization code and multiple companies
 *
 * @param authCode - Authorization code for the API
 * @param companies - Array of AnalyzeCompany objects
 * @returns Complete AnalyzeCompanyInput ready to be sent to the API
 */
export function buildCompanyAnalysisInput(authCode: number, companies: AnalyzeCompany[]): AnalyzeCompanyInput {
	return {
		auth_code: authCode,
		analysis: companies,
	};
}
