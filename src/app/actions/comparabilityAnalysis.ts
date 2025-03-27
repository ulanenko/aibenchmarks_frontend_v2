'use server';

import {
    buildComparabilityAnalysisInput,
    initiateComparabilityAnalysis,
    ComparabilityAnalysisInput,
    ComparabilityAnalysis,
} from '@/services/backend/api/comparability';
import { CompanyDTO } from '@/lib/company/type';

/**
 * Server action to initiate comparability analysis for a list of companies
 *
 * @param companies - Array of company data to analyze
 * @param authCode - Authorization code for the API
 * @returns Response with search IDs or error information
 */
export async function initiateComparabilityAnalysisAction(
    companies: (Partial<CompanyDTO> & {id?: number; name: string; searchId: string})[],
    authCode: number = 6666666, // Default auth code, replace with actual auth mechanism
    options: {
        idealProductService: string;
        idealFunctionalProfile: string;
        language?: string;
        relaxedProduct?: boolean;
        relaxedFunction?: boolean;
    },
): Promise<{success: boolean; message: string; searchIds?: string[]}> {
    try {
        // Validate input
        if (!companies || companies.length === 0) {
            return {
                success: false,
                message: 'No companies provided for analysis',
            };
        }

        if (!options.idealProductService || !options.idealFunctionalProfile) {
            return {
                success: false,
                message: 'Ideal product/service and functional profile descriptions are required',
            };
        }

        // Map the company data to the format expected by the analysis API
        const analysisCompanies: ComparabilityAnalysis[] = companies.map((company) => {
            return {
                search_id: company.searchId,
                ideal_product_service: options.idealProductService,
                ideal_functional_profile: options.idealFunctionalProfile,
                lang: options.language || 'en',
                relaxed_product: options.relaxedProduct || false,
                relaxed_function: options.relaxedFunction || false,
            };
        });

        // Build the full analysis request
        const analysisInput: ComparabilityAnalysisInput = {
            auth_code: authCode,
            analysis: analysisCompanies,
        };

        // Initiate the analysis
        const result = await initiateComparabilityAnalysis(analysisInput);

        if (!result) {
            return {
                success: false,
                message: 'Failed to initiate comparability analysis. The API returned no response.',
            };
        }

        // Extract search IDs from the response (if available)
        const searchIds = result.search_ids;

        if (!searchIds || searchIds.length === 0) {
            return {
                success: false,
                message: 'The API returned no search IDs',
            };
        }

        return {
            success: true,
            message: `Successfully initiated comparability analysis for ${companies.length} companies`,
            searchIds,
        };
    } catch (error) {
        console.error('Error in initiateComparabilityAnalysisAction:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
} 