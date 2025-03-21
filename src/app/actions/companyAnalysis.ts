'use server';

import {
	buildCompanyAnalysisRequest,
	buildCompanyAnalysisInput,
	initiateCompanyAnalysis,
	AnalyzeCompanyAPIResponse,
	AnalyzeCompany,
} from '@/services/backend/api/searchcompany';
import {updateCompanySearchIds} from '@/services/server/company-service.server';
import {CompanyDTO, CreateCompanyDTO} from '@/lib/company/type';

/**
 * Server action to initiate company analysis for a list of companies
 *
 * @param companies - Array of company data to analyze
 * @param authCode - Authorization code for the API
 * @returns Response with search IDs or error information
 */
export async function initiateCompanyAnalysisAction(
	companies: (Partial<CompanyDTO> & {id?: number; name: string; country: string; website?: string})[],
	authCode: number = 6666666, // Default auth code, replace with actual auth mechanism
	options: {
		takeScreenshot?: boolean;
		language?: string;
		useDbDescriptions?: boolean;
	} = {},
): Promise<{success: boolean; message: string; searchIds?: string[]}> {
	try {
		// Validate input
		if (!companies || companies.length === 0) {
			return {
				success: false,
				message: 'No companies provided for analysis',
			};
		}

		// Map the company data to the format expected by the analysis API
		const analysisCompanies: AnalyzeCompany[] = companies.map((company) => {
			return buildCompanyAnalysisRequest(
				company.name,
				company.country || '',
				company.website || company.url || '',
				options.language || 'en',
				options.takeScreenshot !== undefined ? options.takeScreenshot : true,
				{
					useDbDescriptions: options.useDbDescriptions || false,
					tradeDatabaseDescription: company.tradeDescriptionEnglish || company.tradeDescriptionOriginal || undefined,
					fullDatabaseOverview: company.fullOverview || company.fullOverviewManual || undefined,
					siteMatch:
						company.databaseId || company.streetAndNumber || company.addressLine1
							? {
									bvdId: company.databaseId || undefined,
									streetAndNumber: company.streetAndNumber || undefined,
									addressLine: company.addressLine1 || undefined,
							  }
							: undefined,
				},
			);
		});

		// Build the full analysis request
		const analysisInput = buildCompanyAnalysisInput(authCode, analysisCompanies);

		// Initiate the analysis
		const result = await initiateCompanyAnalysis(analysisInput);

		if (!result) {
			return {
				success: false,
				message: 'Failed to initiate company analysis. The API returned no response.',
			};
		}

		// Extract search IDs from the response (if available)
		const searchIds = result.filter((item) => item.search_id).map((item) => item.search_id as string);

		// Check if there were any errors
		const errors = result
			.filter((item) => item.error_message && item.error_message.length > 0)
			.map((item) => `${item.company_name}: ${item.error_message?.join(', ')}`);

		if (errors.length > 0) {
			return {
				success: false,
				message: `Analysis encountered errors: ${errors.join('; ')}`,
				searchIds: searchIds.length > 0 ? searchIds : undefined,
			};
		}

		// If we have company IDs, save the search IDs to the companies
		const companyIdsWithSearchIds: Record<number, string> = {};

		companies.forEach((company, index) => {
			// Only process companies with valid IDs and if we have a search ID for this index
			if (company.id && company.id > 0 && index < result.length && result[index].search_id) {
				companyIdsWithSearchIds[company.id] = result[index].search_id as string;
			}
		});

		// If we have companies with IDs, update them with their search IDs
		if (Object.keys(companyIdsWithSearchIds).length > 0) {
			// Update database with search IDs (this would make it "In queue" from the backend perspective)
			await updateCompanySearchIds(companyIdsWithSearchIds);

			// For each company in the current session, we could also trigger an update to "IN_PROGRESS"
			// This would typically be done via a polling mechanism in the frontend
			// when it detects the search process has started
		}

		// Store the searchIds in the database
		if (searchIds && searchIds.length > 0) {
			// TODO: Add logic to store the search IDs in the database
			// Note: After storing, we would typically update the frontend via polling
			// to reflect that the search is in progress
			//
			// With the simplified approach, the categorizer will now derive status from:
			// - frontendState.webSearchInitialized (set when analysis begins)
			// - company.searchId (set when search ID is received)
			// - database state (would be checked via polling)
		}

		return {
			success: true,
			message: `Successfully initiated analysis for ${result.length} companies`,
			searchIds,
		};
	} catch (error) {
		console.error('Error in initiateCompanyAnalysisAction:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'An unknown error occurred',
		};
	}
}
